// Paystack client helper: opens inline widget with Paystack public key
export const PAYSTACK_PUBLIC_KEY = 'pk_live_4126067326a4ff0fbdac73d10db5474b483a824d';

export function payWithPaystack({amountGhs, emailOrDummy, phone, metadata = {}, onSuccess, onClose}) {
  const amountPesewas = Math.round(amountGhs * 100);
  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: emailOrDummy || (phone + '@example.com'),
    amount: amountPesewas,
    currency: 'GHS',
    channels: ['mobile_money'],
    metadata: { custom_fields: [{display_name: 'phone', variable_name: 'phone', value: phone}, ...Object.entries(metadata).map(([k,v])=>({display_name:k,variable_name:k,value:v})) ]},
    callback: function(response) { if (onSuccess) onSuccess(response); },
    onClose: function() { if (onClose) onClose(); }
  });
  handler.openIframe();
}
