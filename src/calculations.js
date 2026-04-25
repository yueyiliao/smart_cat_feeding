export const convertWeightToKg = (weight, unit) => {
  if (!weight) {
    return ''
  }

  const parsedWeight = Number.parseFloat(weight)

  if (Number.isNaN(parsedWeight) || parsedWeight <= 0) {
    return ''
  }

  if (unit === 'lb') {
    return (parsedWeight * 0.45359237).toFixed(3)
  }

  return parsedWeight.toFixed(3)
}

export const calculateRer = (weightKg) => {
  const parsedWeightKg = Number.parseFloat(weightKg)

  if (Number.isNaN(parsedWeightKg) || parsedWeightKg <= 0) {
    return null
  }

  return 70 * parsedWeightKg ** 0.75
}

export const getCatAgeCategory = (age) => {
  if (age === 'less-than-1') {
    return 'kitten'
  }

  if (['1', '2', '3', '4', '5', '6'].includes(age)) {
    return 'adult'
  }

  if (['7', '8', '9', '10', '11'].includes(age)) {
    return 'senior'
  }

  if (age === '12-plus') {
    return 'geriatric'
  }

  return null
}

const kittenDerFactors = {
  1: 240,
  2: 210,
  3: 200,
  4: 175,
  5: 145,
  6: 135,
  7: 120,
  8: 110,
  9: 100,
  10: 95,
  11: 90,
  12: 85,
}

export const calculateKittenDer = (weightKg, kittenAgeMonths) => {
  const parsedWeightKg = Number.parseFloat(weightKg)
  const parsedKittenAgeMonths = Number.parseInt(kittenAgeMonths, 10)

  if (
    Number.isNaN(parsedWeightKg) ||
    parsedWeightKg <= 0 ||
    Number.isNaN(parsedKittenAgeMonths) ||
    parsedKittenAgeMonths <= 0
  ) {
    return null
  }

  const factor = kittenDerFactors[parsedKittenAgeMonths]

  if (!factor) {
    return null
  }

  return parsedWeightKg * factor
}

const adultDerMultipliers = {
  yes: {
    indoor: 1.2,
    'indoor-outdoor': 1.2,
    outdoor: 1.4,
  },
  no: {
    indoor: 1.4,
    'indoor-outdoor': 1.4,
    outdoor: 1.6,
  },
}

const adultHealthGoalFactors = {
  maintain: 1.0,
  gain: 1.1,
}

const seniorDerMultipliers = {
  yes: {
    indoor: 1,
    'indoor-outdoor': 1,
    outdoor: 1.2,
  },
  no: {
    indoor: 1.2,
    'indoor-outdoor': 1.2,
    outdoor: 1.2,
  },
}

const seniorHealthGoalFactors = {
  maintain: 1.0,
  gain: 1.2,
}

const geriatricDerMultiplier = 1.35

const geriatricHealthGoalFactors = {
  maintain: 1.0,
}

const geriatricWeightGainMultiplier = 1.1

const roundToSingleDecimal = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null
  }

  return Math.round(value * 10) / 10
}

export const getAdultDerMultiplier = (neuteredStatus, activityLevel) => {
  return adultDerMultipliers[neuteredStatus]?.[activityLevel] ?? null
}

export const calculateAdultDer = (rer, neuteredStatus, activityLevel) => {
  if (typeof rer !== 'number' || Number.isNaN(rer) || rer <= 0) {
    return null
  }

  const multiplier = getAdultDerMultiplier(neuteredStatus, activityLevel)

  if (!multiplier) {
    return null
  }

  return rer * multiplier
}

export const calculateAdultFeedingPlan = (
  rer,
  der,
  healthGoal,
) => {
  if (
    typeof rer !== 'number' ||
    Number.isNaN(rer) ||
    rer <= 0 ||
    typeof der !== 'number' ||
    Number.isNaN(der) ||
    der <= 0
  ) {
    return null
  }

  if (healthGoal === 'lose') {
    return {
      type: 'weight-loss',
      week1to2: roundToSingleDecimal(rer * 0.9),
      week3Plus: roundToSingleDecimal(rer * 0.8),
    }
  }

  const goalFactor = adultHealthGoalFactors[healthGoal]

  if (!goalFactor) {
    return null
  }

  return {
    type: 'standard',
    dailyAmount: roundToSingleDecimal(der * goalFactor),
  }
}

export const getSeniorDerMultiplier = (neuteredStatus, activityLevel) => {
  return seniorDerMultipliers[neuteredStatus]?.[activityLevel] ?? null
}

export const calculateSeniorDer = (rer, neuteredStatus, activityLevel) => {
  if (typeof rer !== 'number' || Number.isNaN(rer) || rer <= 0) {
    return null
  }

  const multiplier = getSeniorDerMultiplier(neuteredStatus, activityLevel)

  if (!multiplier) {
    return null
  }

  return rer * multiplier
}

export const calculateSeniorFeedingPlan = (
  rer,
  der,
  healthGoal,
) => {
  if (
    typeof rer !== 'number' ||
    Number.isNaN(rer) ||
    rer <= 0 ||
    typeof der !== 'number' ||
    Number.isNaN(der) ||
    der <= 0
  ) {
    return null
  }

  if (healthGoal === 'lose') {
    return {
      type: 'weight-loss',
      week1to2: roundToSingleDecimal(rer * 0.9),
      week3Plus: roundToSingleDecimal(rer * 0.8),
    }
  }

  const goalFactor = seniorHealthGoalFactors[healthGoal]

  if (!goalFactor) {
    return null
  }

  return {
    type: 'standard',
    dailyAmount: roundToSingleDecimal(der * goalFactor),
  }
}

export const getGeriatricDerMultiplier = () => {
  return geriatricDerMultiplier
}

export const calculateGeriatricDer = (rer) => {
  if (typeof rer !== 'number' || Number.isNaN(rer) || rer <= 0) {
    return null
  }

  return rer * geriatricDerMultiplier
}

export const calculateGeriatricFeedingPlan = (
  rer,
  der,
  healthGoal,
) => {
  if (
    typeof rer !== 'number' ||
    Number.isNaN(rer) ||
    rer <= 0 ||
    typeof der !== 'number' ||
    Number.isNaN(der) ||
    der <= 0
  ) {
    return null
  }

  if (healthGoal === 'lose') {
    return {
      type: 'vet-alert',
    }
  }

  if (healthGoal === 'gain') {
    return {
      type: 'standard',
      dailyAmount: roundToSingleDecimal(der * geriatricWeightGainMultiplier),
    }
  }

  const goalFactor = geriatricHealthGoalFactors[healthGoal]

  if (!goalFactor) {
    return null
  }

  return {
    type: 'standard',
    dailyAmount: roundToSingleDecimal(der * goalFactor),
  }
}
