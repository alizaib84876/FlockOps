export function currentLiveBirds(params: {
  initialBirds: number;
  mortality: number;
  birdsSold: number;
}) {
  return Math.max(
    0,
    params.initialBirds - params.mortality - params.birdsSold,
  );
}

export function mortalityRatePercent(params: {
  initialBirds: number;
  mortality: number;
}) {
  if (params.initialBirds <= 0) return 0;
  return (params.mortality / params.initialBirds) * 100;
}

export function feedConversionRatio(params: {
  totalFeedKg: number;
  totalLiveWeightSoldKg: number;
}) {
  if (params.totalLiveWeightSoldKg <= 0) return null;
  return params.totalFeedKg / params.totalLiveWeightSoldKg;
}

export function flockNetProfit(params: {
  salesRevenue: number;
  flockExpenses: number;
  allocatedMiscExpenses: number;
}) {
  return (
    params.salesRevenue -
    (params.flockExpenses + params.allocatedMiscExpenses)
  );
}
