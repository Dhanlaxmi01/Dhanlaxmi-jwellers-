import { JewelryProduct, LiveRates, PriceBreakdown } from '../types';

export const calculateProductPrice = (
  product: JewelryProduct,
  rates: LiveRates,
  makingDiscountPercent: number = 0
): PriceBreakdown => {
  let ratePerGram = 0;
  
  if (product.purity === '24K') {
    ratePerGram = rates.gold24k / 10;
  } else if (product.purity === '22K') {
    ratePerGram = rates.gold22k / 10;
  } else if (product.purity === '18K') {
    ratePerGram = rates.gold18k / 10;
  } else if (product.purity === '14K') {
    ratePerGram = rates.gold14k / 10;
  } else if (product.purity === '925 Silver') {
    ratePerGram = rates.silver999 / 1000;
  } else {
    ratePerGram = rates.gold22k / 10;
  }

  // Metal Base Value
  const metalWeight = product.netGoldWeight > 0 ? product.netGoldWeight : product.grossWeight;
  const goldValue = Math.round(metalWeight * ratePerGram);

  // Diamond Value (estimated ₹75,000/carat standard benchmark for VVS-VS certified diamonds)
  const diamondRatePerCarat = 75000;
  const diamondValue = product.diamondCarat ? Math.round(product.diamondCarat * diamondRatePerCarat) : 0;

  // Gemstones value
  const gemstoneValue = product.gemstoneCharge || 0;

  // Making charges calculation
  const effectiveMakingPercent = product.makingChargePercent || rates.defaultMakingChargePercent || 14;
  const rawMakingCharges = Math.round(goldValue * (effectiveMakingPercent / 100));
  
  const discountOnMaking = makingDiscountPercent > 0 
    ? Math.round(rawMakingCharges * (makingDiscountPercent / 100))
    : 0;
    
  const makingCharges = Math.max(0, rawMakingCharges - discountOnMaking);

  // Subtotal before tax
  const subtotal = goldValue + diamondValue + gemstoneValue + makingCharges;

  // 3% standard Gold/Jewelry GST in India
  const gstRate = rates.gstRate || 0.03;
  const gst = Math.round(subtotal * gstRate);

  const totalPrice = subtotal + gst;

  return {
    goldValue,
    diamondValue,
    gemstoneValue,
    makingCharges,
    discountOnMaking,
    subtotal,
    gst,
    totalPrice,
    ratePerGramApplied: ratePerGram
  };
};

export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};
