// api/stripe-webhook.js
// Riceve eventi da Stripe e aggiorna la tabella subscriptions in Supabase.
// Variabili d'ambiente richieste (da impostare in Vercel):
//   STRIPE_SECRET_KEY — chiave segreta Stripe (sk_live_... o sk_test_...)
//   STRIPE_WEBHOOK_SECRET — segreto webhook (whsec_...)
//   SUPABASE_URL — URL del progetto Supabase
//   SUPABASE_SERVICE_ROLE_KEY — chiave service_role (SEGRETA, mai nel frontend)

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Service role bypassa RLS — usato SOLO nel backend
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Legge il body grezzo (necessario per la verifica firma Stripe)
async function getRawBody(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

module.exports = async (req, res) => {
  // Solo POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 1. Verifica firma Stripe
  const rawBody = await getRawBody(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[Webhook] Firma non valida:', err.message);
    return res.status(400).json({ error: 'Firma webhook non valida' });
  }

  // 2. Gestisci gli eventi
  try {
    switch (event.type) {

      // ═══ PAGAMENTO COMPLETATO ═══
      case 'checkout.session.completed': {
        const session = event.data.object;
        const email = (
          session.customer_details?.email ||
          session.customer_email ||
          ''
        ).toLowerCase().trim();

        if (!email) {
          console.error('[Webhook] Nessuna email nella sessione:', session.id);
          break;
        }

        const subscriptionId = session.subscription;
        const customerId = session.customer;

        // Determina il piano dal prezzo (centesimi)
        // Pro = €29/mese = 2900, Enterprise = €199/mese = 19900
        const amount = session.amount_total || 0;
        const plan = amount >= 10000 ? 'enterprise' : 'pro';

        if (subscriptionId) {
          // Verifica che non esista già
          const { data: existing } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('stripe_subscription_id', subscriptionId)
            .maybeSingle();

          if (!existing) {
            // Recupera dettagli abbonamento da Stripe
            const sub = await stripe.subscriptions.retrieve(subscriptionId);

            const { error } = await supabase.from('subscriptions').insert({
              stripe_customer_id: customerId || '',
              stripe_subscription_id: subscriptionId,
              customer_email: email,
              plan: plan,
              status: 'active',
              current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            });

            if (error) {
              console.error('[Webhook] Errore insert subscription:', error);
            } else {
              console.log(`[Webhook] Subscription creata: ${email} → ${plan}`);
            }
          }
        } else {
          // Pagamento una tantum (non subscription) — gestisci se necessario
          console.log('[Webhook] Pagamento senza subscription, email:', email);
        }
        break;
      }

      // ═══ SUBSCRIPTION AGGIORNATA ═══
      case 'customer.subscription.updated': {
        const sub = event.data.object;

        let status = sub.status; // active, past_due, canceled, etc.
        if (sub.cancel_at_period_end && sub.status === 'active') {
          status = 'canceling'; // L'utente ha cancellato ma è attivo fino a fine periodo
        }

        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: status,
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', sub.id);

        if (error) {
          console.error('[Webhook] Errore update subscription:', error);
        } else {
          console.log(`[Webhook] Subscription aggiornata: ${sub.id} → ${status}`);
        }
        break;
      }

      // ═══ SUBSCRIPTION CANCELLATA ═══
      case 'customer.subscription.deleted': {
        const sub = event.data.object;

        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', sub.id);

        if (error) {
          console.error('[Webhook] Errore delete subscription:', error);
        } else {
          console.log(`[Webhook] Subscription cancellata: ${sub.id}`);
        }
        break;
      }

      // ═══ PAGAMENTO FALLITO ═══
      case 'invoice.payment_failed': {
        const invoice = event.data.object;

        if (invoice.subscription) {
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', invoice.subscription);

          if (error) {
            console.error('[Webhook] Errore payment_failed:', error);
          } else {
            console.log(`[Webhook] Pagamento fallito: ${invoice.subscription}`);
          }
        }
        break;
      }

      default:
        // Eventi non gestiti — ignora
        break;
    }
  } catch (err) {
    console.error('[Webhook] Errore processing:', err);
    return res.status(500).json({ error: 'Errore interno' });
  }

  // 3. Rispondi 200 a Stripe (conferma ricezione)
  return res.status(200).json({ received: true });
};

// Disabilita il body parser di Vercel (serve il body grezzo per Stripe)
module.exports.config = {
  api: {
    bodyParser: false,
  },
};
