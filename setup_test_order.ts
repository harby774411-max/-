import { supabase } from './src/lib/supabase';

async function run() {
  // 1. Update Settings with the new Delivery Number
  const { data: settings, error: settingsError } = await supabase
    .from('settings')
    .select('*')
    .limit(1)
    .single();

  if (settingsError) {
    console.error('Error fetching settings:', settingsError);
    return;
  }

  const { error: updateError } = await supabase
    .from('settings')
    .update({ delivery_num_1: '+967783363977' })
    .eq('id', settings.id);

  if (updateError) {
    console.error('Error updating settings:', updateError);
    return;
  }
  console.log('✅ Settings updated with delivery number: +967783363977');

  // 2. Create Test Order for the Customer
  const testOrder = {
    customer_name: 'عميل تجريبي (Harby Test)',
    phone: '+967781272125',
    address: 'صنعاء - شارع الخمسين - أمام المول الرئيسي',
    total: 25000,
    status: 'pending',
    items: [
      { id: 'test-1', nameAr: 'سيروم فيتامين سي المطور', quantity: 1, price: 8500 },
      { id: 'test-2', nameAr: 'مرطب العناية الفائقة', quantity: 1, price: 8000 }
    ]
  };

  const { data: newOrder, error: orderError } = await supabase
    .from('orders')
    .insert(testOrder)
    .select()
    .single();

  if (orderError) {
    console.error('Error creating test order:', orderError);
    return;
  }
  console.log('✅ Test order created successfully with ID:', newOrder.id);
}

run();
