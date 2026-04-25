import { useEffect, useState } from 'react'
import {
  calculateAdultDer,
  calculateAdultFeedingPlan,
  calculateGeriatricDer,
  calculateGeriatricFeedingPlan,
  calculateKittenDer,
  calculateRer,
  calculateSeniorDer,
  calculateSeniorFeedingPlan,
  convertWeightToKg,
  getAdultDerMultiplier,
  getCatAgeCategory,
  getGeriatricDerMultiplier,
  getSeniorDerMultiplier,
} from './calculations'
import { foodCatalog } from './foodCatalog'
import bowlWithDryImage from './assets/bowl_with_dry.png'
import bowlWithWetAndDryImage from './assets/bowl_with_wet_and_dry.png'
import bowlWithWetImage from './assets/bowl_with_wet.png'
import emptyBowlImage from './assets/empty_bowl.png'
import './App.css'

const weightUnitOptions = [
  { value: 'lb', label: 'lbs' },
  { value: 'kg', label: 'kg' },
]

const activityOptions = [
  { value: 'indoor', label: 'Indoor - Couch Potato' },
  { value: 'indoor-outdoor', label: 'Indoor Active / Partial Outdoor' },
  { value: 'outdoor', label: 'Fully Outdoor / Highly Active' },
]

const neuteredOptions = [
  { value: 'yes', label: 'Neutered/Spayed' },
  { value: 'no', label: 'Intact' },
]

const healthGoalOptions = [
  { value: 'maintain', label: 'Maintain weight' },
  { value: 'lose', label: 'Weight Loss' },
  { value: 'gain', label: 'Weight Gain' },
]

const ageOptions = [
  { value: 'less-than-1', label: 'Less than 1' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
  { value: '6', label: '6' },
  { value: '7', label: '7' },
  { value: '8', label: '8' },
  { value: '9', label: '9' },
  { value: '10', label: '10' },
  { value: '11', label: '11' },
  { value: '12-plus', label: '12+' },
]

const kittenMonthOptions = [
  { value: '', label: 'Select month' },
  { value: '0', label: '0 months' },
  { value: '1', label: '1 month' },
  { value: '2', label: '2 months' },
  { value: '3', label: '3 months' },
  { value: '4', label: '4 months' },
  { value: '5', label: '5 months' },
  { value: '6', label: '6 months' },
  { value: '7', label: '7 months' },
  { value: '8', label: '8 months' },
  { value: '9', label: '9 months' },
  { value: '10', label: '10 months' },
  { value: '11', label: '11 months' },
  { value: '12', label: '12 months' },
]

const ribCheckResponseOptions = [
  { value: 'yes', label: 'Yes!' },
  { value: 'sort-of', label: 'Sort of' },
  { value: 'nope', label: 'Nope' },
  { value: 'skip', label: 'Skip For Now' },
]

const foodModeOptions = [
  {
    value: 'manual',
    label: 'Manual Entry',
    hint: 'Manually type in the calorie information',
    isDisabled: false,
  },
  {
    value: 'database',
    label: 'Database Search',
    hint: 'Use our comprehensive database to search for your cat food brand',
    isDisabled: false,
  },
  {
    value: 'photo',
    label: 'Photo Scan',
    hint: 'Coming soon',
    isDisabled: true,
  },
]

const wetFoodUnitOptions = [
  { value: 'can', label: 'kcal/can' },
  { value: 'pouch', label: 'kcal/pouch' },
]

const wetFoodPortionOptions = [
  { value: '1', label: '1', chartClass: 'portion-chart--full' },
  { value: '2/3', label: '2/3', chartClass: 'portion-chart--two-thirds' },
  { value: '1/2', label: '1/2', chartClass: 'portion-chart--half' },
  { value: '1/3', label: '1/3', chartClass: 'portion-chart--third' },
  { value: '1/4', label: '1/4', chartClass: 'portion-chart--quarter' },
]

const wetFoodExpandedPortionOptions = [
  { value: '2', label: '2', chartClass: 'portion-chart--double-full' },
  {
    value: '1+2/3',
    label: '1 + 2/3',
    chartClass: 'portion-chart--one-two-thirds',
  },
  {
    value: '1+1/2',
    label: '1 + 1/2',
    chartClass: 'portion-chart--one-half',
  },
  {
    value: '1+1/3',
    label: '1 + 1/3',
    chartClass: 'portion-chart--one-third',
  },
  {
    value: '1+1/4',
    label: '1 + 1/4',
    chartClass: 'portion-chart--one-quarter',
  },
]

const wetFoodPortionFractions = {
  '1': 1,
  '2': 2,
  '1+2/3': 1 + 2 / 3,
  '1+1/2': 1 + 1 / 2,
  '1+1/3': 1 + 1 / 3,
  '1+1/4': 1 + 1 / 4,
  '2/3': 2 / 3,
  '1/2': 1 / 2,
  '1/3': 1 / 3,
  '1/4': 1 / 4,
}

const getDryFoodCalorieWarning = (caloriesPerKg) => {
  if (typeof caloriesPerKg !== 'number' || Number.isNaN(caloriesPerKg) || caloriesPerKg <= 0) {
    return ''
  }

  if (caloriesPerKg <= 1000) {
    return 'Dry food is physically incapable of being this low calorie. The user likely entered kcal/cup by mistake.'
  }

  if (caloriesPerKg < 2800) {
    return 'Is this dry kibble? 🥗 This is exceptionally low for dry food. Please double-check the label!'
  }

  if (caloriesPerKg > 4800 && caloriesPerKg < 6500) {
    return 'Whoa, rocket fuel! 🚀 This is very calorie-dense. Is this a specialty high-performance food?'
  }

  if (caloriesPerKg >= 6500) {
    return 'Physics check: Kibble would essentially have to be pure lard to hit this. Definitely a typo.'
  }

  return ''
}

const getWetFoodCalorieWarning = (caloriesPerCan, unit) => {
  if (
    unit !== 'can' ||
    typeof caloriesPerCan !== 'number' ||
    Number.isNaN(caloriesPerCan) ||
    caloriesPerCan <= 0
  ) {
    return ''
  }

  if (caloriesPerCan > 300 && caloriesPerCan < 500) {
    return "That's a huge can! 🥫 Most standard cat cans (6oz) are about 200 kcal. Please double-check the label."
  }

  if (caloriesPerCan > 500) {
    return "That's a lot of energy in one can! 🥫 Are you feeding a giant 12.5oz 'Tomato-sized' can? If not, please double-check the calories on the label!"
  }

  return ''
}

const foodChoiceCards = [
  {
    value: 'dry',
    label: 'Dry Kibble',
    description: 'Just the crunchy stuff',
  },
  {
    value: 'wet',
    label: 'Wet Food',
    description: 'Cans or pouches',
  },
]

const getFoodCatalogCaloriesLabel = (product) => {
  if (product.foodType === 'dry') {
    return `${product.kcalPerKg} kcal/kg`
  }

  return `${product.kcalPerUnit} kcal/${product.unitType ?? 'unit'}`
}

const ProductThumbnail = ({ product }) => {
  const [hasImageError, setHasImageError] = useState(false)
  const shouldShowImage = Boolean(product.imageUrl) && !hasImageError

  return shouldShowImage ? (
    <img
      className="product-thumbnail"
      src={product.imageUrl}
      alt={product.productName}
      loading="lazy"
      onError={() => setHasImageError(true)}
    />
  ) : (
    <div className="product-thumbnail product-thumbnail--fallback" aria-hidden="true">
      {product.foodType === 'dry' ? 'Dry' : 'Wet'}
    </div>
  )
}

const searchCorrections = {
  purin: 'purina',
  chiken: 'chicken',
  canine: 'canin',
}

const normalizeSearchText = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const getSearchTerms = (query) =>
  normalizeSearchText(query)
    .split(' ')
    .filter(Boolean)
    .map((term) => searchCorrections[term] ?? term)

const getLevenshteinDistance = (left, right) => {
  if (left === right) {
    return 0
  }

  if (left.length === 0) {
    return right.length
  }

  if (right.length === 0) {
    return left.length
  }

  const matrix = Array.from({ length: left.length + 1 }, () =>
    Array(right.length + 1).fill(0),
  )

  for (let rowIndex = 0; rowIndex <= left.length; rowIndex += 1) {
    matrix[rowIndex][0] = rowIndex
  }

  for (let columnIndex = 0; columnIndex <= right.length; columnIndex += 1) {
    matrix[0][columnIndex] = columnIndex
  }

  for (let rowIndex = 1; rowIndex <= left.length; rowIndex += 1) {
    for (let columnIndex = 1; columnIndex <= right.length; columnIndex += 1) {
      const substitutionCost =
        left[rowIndex - 1] === right[columnIndex - 1] ? 0 : 1

      matrix[rowIndex][columnIndex] = Math.min(
        matrix[rowIndex - 1][columnIndex] + 1,
        matrix[rowIndex][columnIndex - 1] + 1,
        matrix[rowIndex - 1][columnIndex - 1] + substitutionCost,
      )
    }
  }

  return matrix[left.length][right.length]
}

const buildProductSearchIndex = (product) => {
  const normalizedBrand = normalizeSearchText(product.brand)
  const normalizedProductName = normalizeSearchText(product.productName)
  const normalizedFoodType = normalizeSearchText(product.foodType)
  const normalizedCombined = normalizeSearchText(
    [
      product.brand,
      product.productLine,
      product.productName,
      product.foodType,
      product.searchTokens,
    ]
      .filter(Boolean)
      .join(' '),
  )
  const tokens = Array.from(new Set(normalizedCombined.split(' ').filter(Boolean)))

  return {
    normalizedBrand,
    normalizedProductName,
    normalizedFoodType,
    normalizedCombined,
    tokens,
  }
}

const getTokenMatchScore = (queryToken, productTokens) => {
  let bestScore = 0

  for (const productToken of productTokens) {
    if (productToken === queryToken) {
      return 32
    }

    if (productToken.startsWith(queryToken) || queryToken.startsWith(productToken)) {
      bestScore = Math.max(bestScore, 24)
      continue
    }

    if (productToken.includes(queryToken)) {
      bestScore = Math.max(bestScore, 18)
      continue
    }

    const allowedDistance = queryToken.length >= 7 ? 2 : 1
    if (getLevenshteinDistance(queryToken, productToken) <= allowedDistance) {
      bestScore = Math.max(bestScore, 12)
    }
  }

  return bestScore
}

const searchCatalogProducts = (products, query) => {
  const normalizedTerms = getSearchTerms(query)

  if (normalizedTerms.length === 0) {
    return []
  }

  const normalizedQuery = normalizedTerms.join(' ')

  return products
    .map((product) => {
      const searchIndex = buildProductSearchIndex(product)
      let score = 0

      if (searchIndex.normalizedProductName === normalizedQuery) {
        score += 220
      } else if (searchIndex.normalizedBrand === normalizedQuery) {
        score += 200
      } else if (searchIndex.normalizedCombined === normalizedQuery) {
        score += 180
      }

      if (searchIndex.normalizedProductName.startsWith(normalizedQuery)) {
        score += 110
      } else if (searchIndex.normalizedProductName.includes(normalizedQuery)) {
        score += 80
      }

      if (searchIndex.normalizedBrand.startsWith(normalizedQuery)) {
        score += 90
      } else if (searchIndex.normalizedBrand.includes(normalizedQuery)) {
        score += 65
      }

      if (searchIndex.normalizedCombined.includes(normalizedQuery)) {
        score += 50
      }

      if (searchIndex.normalizedFoodType === normalizedQuery) {
        score += 30
      }

      for (const term of normalizedTerms) {
        const tokenScore = getTokenMatchScore(term, searchIndex.tokens)

        if (tokenScore === 0) {
          return null
        }

        score += tokenScore
      }

      return {
        product,
        score,
      }
    })
    .filter(Boolean)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score
      }

      return left.product.productName.localeCompare(right.product.productName)
    })
    .map((entry) => entry.product)
}

const sectionOrder = ['overview', 'profile', 'food', 'summary']
const sectionTitles = {
  overview: 'Overview',
  profile: 'Cat Profile',
  food: 'Food Details',
  summary: 'Meal Plan',
}

const isInteractiveElement = (target) =>
  target instanceof HTMLElement &&
  Boolean(target.closest('button, input, select, textarea, a, label'))

function App() {
  const [isBirthToWeaningDismissed, setIsBirthToWeaningDismissed] =
    useState(false)
  const [isRibCheckDismissed, setIsRibCheckDismissed] = useState(false)
  const [isWetPortionModalOpen, setIsWetPortionModalOpen] = useState(false)
  const [showExpandedWetPortions, setShowExpandedWetPortions] = useState(false)
  const [isWetOverfeedAlertDismissed, setIsWetOverfeedAlertDismissed] =
    useState(false)
  const [isOverviewCollapsed, setIsOverviewCollapsed] = useState(false)
  const [isProfileCollapsed, setIsProfileCollapsed] = useState(true)
  const [hasStartedStepOne, setHasStartedStepOne] = useState(false)
  const [hasEnteredFoodSection, setHasEnteredFoodSection] = useState(false)
  const [isFoodSectionCollapsed, setIsFoodSectionCollapsed] = useState(true)
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(true)
  const [showIncompleteProfileReminder, setShowIncompleteProfileReminder] =
    useState(false)
  const [databaseSearchQuery, setDatabaseSearchQuery] = useState('')
  const [dryDatabaseSearchQuery, setDryDatabaseSearchQuery] = useState('')
  const [wetDatabaseSearchQuery, setWetDatabaseSearchQuery] = useState('')
  const [selectedDatabaseDryProductId, setSelectedDatabaseDryProductId] = useState('')
  const [selectedDatabaseWetProductId, setSelectedDatabaseWetProductId] = useState('')
  const [hasConfirmedGeriatricVetAlert, setHasConfirmedGeriatricVetAlert] =
    useState(false)
  const [isGeriatricVetAlertDismissed, setIsGeriatricVetAlertDismissed] =
    useState(false)
  const [isKittenWeightLossAlertDismissed, setIsKittenWeightLossAlertDismissed] =
    useState(false)
  const [formData, setFormData] = useState({
    weight: '',
    weightUnit: 'lb',
    weightKg: '',
    age: 'less-than-1',
    kittenAgeMonths: '',
    ribCheckResponse: '',
    activityLevel: 'indoor',
    neuteredStatus: 'yes',
    healthGoal: 'maintain',
    foodInputMode: 'manual',
    hasDryFood: false,
    hasWetFood: false,
    dryFoodCalories: '',
    wetFoodCalories: '',
    wetFoodUnit: 'can',
    wetFoodPortion: '',
  })

  const handleChange = (event) => {
    const { name, value } = event.target

    if (name === 'age' || name === 'kittenAgeMonths') {
      setIsBirthToWeaningDismissed(false)
      setIsRibCheckDismissed(false)
      setIsWetOverfeedAlertDismissed(false)
      setHasConfirmedGeriatricVetAlert(false)
      setIsGeriatricVetAlertDismissed(false)
      setIsKittenWeightLossAlertDismissed(false)
    }

    if (name === 'healthGoal') {
      setIsWetOverfeedAlertDismissed(false)
      setHasConfirmedGeriatricVetAlert(false)
      setIsGeriatricVetAlertDismissed(false)
      setIsKittenWeightLossAlertDismissed(false)
    }

    if (
      [
        'weight',
        'weightUnit',
        'activityLevel',
        'neuteredStatus',
        'wetFoodCalories',
        'wetFoodUnit',
        'wetFoodPortion',
      ].includes(name)
    ) {
      setIsWetOverfeedAlertDismissed(false)
    }

    if (name === 'foodChoice') {
      if (isProfileComplete) {
        setHasEnteredFoodSection(true)
        setShowIncompleteProfileReminder(false)
        focusSection('food')
      } else {
        setShowIncompleteProfileReminder(true)
        focusSection('profile')
      }

      setFormData((current) => {
        const nextSelected = !current[value]

        return {
          ...current,
          [value]: nextSelected,
          dryFoodCalories:
            value === 'hasDryFood' && !nextSelected ? '' : current.dryFoodCalories,
          wetFoodCalories:
            value === 'hasWetFood' && !nextSelected ? '' : current.wetFoodCalories,
          wetFoodUnit:
            value === 'hasWetFood' && !nextSelected ? 'can' : current.wetFoodUnit,
          wetFoodPortion:
            value === 'hasWetFood' && !nextSelected ? '' : current.wetFoodPortion,
        }
      })

      if (value === 'hasDryFood' && formData.hasDryFood) {
        setSelectedDatabaseDryProductId('')
      }

      if (value === 'hasWetFood' && formData.hasWetFood) {
        setIsWetPortionModalOpen(false)
        setShowExpandedWetPortions(false)
        setSelectedDatabaseWetProductId('')
      }

      return
    }

    setFormData((current) => {
      const nextFormData = {
        ...current,
        [name]: value,
      }

      if (name === 'weight' || name === 'weightUnit') {
        nextFormData.weightKg = convertWeightToKg(
          name === 'weight' ? value : current.weight,
          name === 'weightUnit' ? value : current.weightUnit,
        )
      }

      if (name === 'age' && value !== 'less-than-1') {
        nextFormData.kittenAgeMonths = ''
        nextFormData.ribCheckResponse = ''
      }

      if (name === 'kittenAgeMonths' && !['10', '11', '12'].includes(value)) {
        nextFormData.ribCheckResponse = ''
      }

      return nextFormData
    })
  }

  const ageIsComplete =
    formData.age && (formData.age !== 'less-than-1' || formData.kittenAgeMonths)
  const isYoungKitten =
    formData.age === 'less-than-1' &&
    ['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(formData.kittenAgeMonths)
  const isProfileComplete =
    Boolean(formData.weight) &&
    Boolean(ageIsComplete) &&
    Boolean(formData.activityLevel) &&
    Boolean(formData.neuteredStatus) &&
    Boolean(formData.healthGoal)

  const completedFields = [
    formData.weight,
    ageIsComplete,
    formData.activityLevel,
    formData.neuteredStatus,
    formData.healthGoal,
  ].filter(Boolean).length
  const incompleteProfileFields = [
    !formData.weight ? 'weight' : null,
    !ageIsComplete ? 'age' : null,
    !formData.activityLevel ? 'activity level' : null,
    !formData.neuteredStatus ? 'neutered status' : null,
    !formData.healthGoal ? 'health goal' : null,
  ].filter(Boolean)
  const incompleteProfileSummary =
    incompleteProfileFields.length > 0 ? incompleteProfileFields.join(', ') : ''

  const focusSection = (section) => {
    setIsOverviewCollapsed(section !== 'overview')
    setIsProfileCollapsed(section !== 'profile')
    setIsFoodSectionCollapsed(section !== 'food')
    setIsSummaryCollapsed(section !== 'summary')
  }

  const goToAdjacentStep = (currentSection, direction) => {
    const currentIndex = sectionOrder.indexOf(currentSection)

    if (currentIndex === -1) {
      return
    }

    const targetSection = sectionOrder[currentIndex + direction]

    if (!targetSection) {
      return
    }

    if (targetSection === 'profile') {
      setHasStartedStepOne(true)
    }

    if (targetSection === 'food' && !hasEnteredFoodSection) {
      if (!isProfileComplete) {
        setShowIncompleteProfileReminder(true)
        focusSection('profile')
        return
      }

      setHasEnteredFoodSection(true)
      setShowIncompleteProfileReminder(false)
    }

    focusSection(targetSection)
  }

  useEffect(() => {
    if (hasStartedStepOne && !isProfileComplete && isProfileCollapsed) {
      setIsProfileCollapsed(false)
    }
  }, [hasStartedStepOne, isProfileCollapsed, isProfileComplete])

  useEffect(() => {
    if (!isProfileComplete) {
      setHasEnteredFoodSection(false)
      setIsFoodSectionCollapsed(true)
    }
  }, [isProfileComplete])

  useEffect(() => {
    if (isProfileComplete && showIncompleteProfileReminder) {
      setShowIncompleteProfileReminder(false)
    }
  }, [isProfileComplete, showIncompleteProfileReminder])

  useEffect(() => {
    if (isYoungKitten && formData.healthGoal === 'lose') {
      setFormData((current) => ({
        ...current,
        healthGoal: 'maintain',
      }))
    }
  }, [formData.healthGoal, isYoungKitten])

  const applyDatabaseProduct = (product) => {
    setHasEnteredFoodSection(true)
    focusSection('food')

    if (product.foodType === 'dry') {
      setSelectedDatabaseDryProductId(product.id)
      setFormData((current) => ({
        ...current,
        foodInputMode: 'database',
        hasDryFood: true,
        dryFoodCalories: String(product.kcalPerKg),
      }))
      return
    }

    setSelectedDatabaseWetProductId(product.id)
    setFormData((current) => ({
      ...current,
      foodInputMode: 'database',
      hasWetFood: true,
      wetFoodCalories: String(product.kcalPerUnit),
      wetFoodUnit: product.unitType === 'pouch' ? 'pouch' : 'can',
    }))
  }

  const removeDatabaseProduct = (foodType) => {
    if (foodType === 'dry') {
      setSelectedDatabaseDryProductId('')
      setFormData((current) => ({
        ...current,
        dryFoodCalories: '',
      }))
      return
    }

    setSelectedDatabaseWetProductId('')
    setFormData((current) => ({
      ...current,
      wetFoodCalories: '',
      wetFoodUnit: 'can',
      wetFoodPortion: '',
    }))
  }

  const weightPlaceholder = formData.weightUnit === 'kg' ? '4.5' : '8.5'
  const catAgeCategory = getCatAgeCategory(formData.age)
  const rer = calculateRer(formData.weightKg)
  const adultDerMultiplier = getAdultDerMultiplier(
    formData.neuteredStatus,
    formData.activityLevel,
  )
  const adultDer = calculateAdultDer(
    rer,
    formData.neuteredStatus,
    formData.activityLevel,
  )
  const adultFeedingPlan = calculateAdultFeedingPlan(
    rer,
    adultDer,
    formData.healthGoal,
  )
  const kittenDer = calculateKittenDer(formData.weightKg, formData.kittenAgeMonths)
  const seniorDerMultiplier = getSeniorDerMultiplier(
    formData.neuteredStatus,
    formData.activityLevel,
  )
  const seniorDer = calculateSeniorDer(
    rer,
    formData.neuteredStatus,
    formData.activityLevel,
  )
  const seniorFeedingPlan = calculateSeniorFeedingPlan(
    rer,
    seniorDer,
    formData.healthGoal,
  )
  const geriatricDerMultiplier = getGeriatricDerMultiplier(
    formData.neuteredStatus,
    formData.activityLevel,
  )
  const geriatricDer = calculateGeriatricDer(
    rer,
    formData.neuteredStatus,
    formData.activityLevel,
  )
  const geriatricFeedingPlan = calculateGeriatricFeedingPlan(
    rer,
    geriatricDer,
    formData.healthGoal,
  )
  const geriatricMaintainFeedingPlan = calculateGeriatricFeedingPlan(
    rer,
    geriatricDer,
    'maintain',
  )
  const isKitten = catAgeCategory === 'kitten'
  const isAdultCat = catAgeCategory === 'adult'
  const isSeniorCat = catAgeCategory === 'senior'
  const isGeriatricCat = catAgeCategory === 'geriatric'
  const kittenMonthValue = Number.parseInt(formData.kittenAgeMonths, 10)
  const showBirthToWeaningModal =
    isKitten && kittenMonthValue === 0 && !isBirthToWeaningDismissed
  const showRibCheckWarning =
    isKitten &&
    [10, 11, 12].includes(kittenMonthValue) &&
    Boolean(formData.kittenAgeMonths)
  const showRibCheckModal = showRibCheckWarning && !isRibCheckDismissed
  const showKittenWeightLossAlertModal =
    showRibCheckWarning &&
    ['yes', 'sort-of', 'nope', 'skip'].includes(formData.ribCheckResponse) &&
    formData.healthGoal === 'lose' &&
    !isKittenWeightLossAlertDismissed
  const showKittenGrowthFirstNote =
    showRibCheckWarning && formData.healthGoal === 'lose'
  const showGeriatricVetAlertModal =
    isGeriatricCat &&
    formData.healthGoal === 'lose' &&
    !isGeriatricVetAlertDismissed
  const hasRibCheckSelection = Boolean(formData.ribCheckResponse)
  const useAdultRerForOlderKitten =
    showRibCheckWarning && formData.ribCheckResponse === 'nope'
  const ageSummary =
    formData.age === 'less-than-1'
      ? kittenMonthOptions.find(
          (option) => option.value === formData.kittenAgeMonths,
        )?.label ?? 'Select month'
      : ageOptions.find((option) => option.value === formData.age)?.label ??
        'Not selected'
  const parsedWeightKg = Number.parseFloat(formData.weightKg)
  const showAdultWeightWarnings = isAdultCat || isSeniorCat || isGeriatricCat
  const hasExtremeWeightBlock =
    showAdultWeightWarnings &&
    !Number.isNaN(parsedWeightKg) &&
    parsedWeightKg >= 25
  let weightWarningMessage = ''
  const enteredWeightWithUnit =
    formData.weight && formData.weightUnit
      ? `${formData.weight}${weightUnitOptions.find(
          (option) => option.value === formData.weightUnit,
        )?.label ?? formData.weightUnit}`
      : ''

  if (showAdultWeightWarnings && !Number.isNaN(parsedWeightKg)) {
    if (parsedWeightKg > 50) {
      weightWarningMessage =
        'Error: "Cat" too large. 🐆 At 50kg, we are legally required to ask if you have a permit for this panther. Our algorithms are for house cats, please consult your local zookeeper for gazelle portion sizes!'
    } else if (parsedWeightKg < 1.5) {
      weightWarningMessage =
        "Wait—is this a tiny kitten or a cloud? ☁️ This weight is quite low for an adult cat. If they're a kitten, make sure you've selected the right age!"
    } else if (parsedWeightKg >= 25) {
      weightWarningMessage = `Wait, ${enteredWeightWithUnit}?! 🦖 Unless your cat is the size of a Golden Retriever, we suspect a 'kg vs. lbs' mix-up. Please check your units!`
    } else if (parsedWeightKg > 10) {
      weightWarningMessage =
        "Whoa! Are we feeding a cat or a small mountain lion? 🐾 Please double-check the weight. If this is correct, we'd love to see a photo of this absolute unit!"
    }
  }
  const calorieLabel =
    isKitten || isAdultCat || isSeniorCat || isGeriatricCat ? 'DER' : 'RER'
  const finalCalories = hasExtremeWeightBlock
    ? null
    : isKitten
    ? showBirthToWeaningModal
      ? null
      : useAdultRerForOlderKitten
        ? rer
        : kittenDer
    : isAdultCat
      ? adultDer
      : isSeniorCat
        ? seniorDer
        : isGeriatricCat
          ? geriatricDer
          : rer
  const calorieSummary = isKitten
    ? hasExtremeWeightBlock
      ? 'Blocked until weight is corrected'
      : showBirthToWeaningModal
      ? 'Not calculated for 0 months'
      : finalCalories
        ? `${Math.round(finalCalories)} kcal/day`
        : 'Add weight and kitten age to calculate'
    : isAdultCat
      ? hasExtremeWeightBlock
        ? 'Blocked until weight is corrected'
        : finalCalories
        ? `${Math.round(finalCalories)} kcal/day`
        : 'Add weight to calculate'
      : isSeniorCat
        ? hasExtremeWeightBlock
          ? 'Blocked until weight is corrected'
          : finalCalories
          ? `${Math.round(finalCalories)} kcal/day`
          : 'Add weight to calculate'
        : isGeriatricCat
          ? hasExtremeWeightBlock
            ? 'Blocked until weight is corrected'
            : finalCalories
            ? `${Math.round(finalCalories)} kcal/day`
            : 'Add weight to calculate'
          : finalCalories
            ? `${Math.round(finalCalories)} kcal/day`
            : 'Add weight to calculate'
  const foodCaloriesUnit =
    wetFoodUnitOptions.find((option) => option.value === formData.wetFoodUnit)
      ?.label ?? 'kcal/can'
  const profileAgeSummary =
    formData.age === 'less-than-1'
      ? formData.kittenAgeMonths
        ? `${formData.kittenAgeMonths} month${formData.kittenAgeMonths === '1' ? '' : 's'}`
        : 'Kitten age needed'
      : `${formData.age} year${formData.age === '1' ? '' : 's'}`
  const profileActivitySummary =
    activityOptions.find((option) => option.value === formData.activityLevel)?.label ??
    'Activity needed'
  const profileNeuteredSummary =
    neuteredOptions.find((option) => option.value === formData.neuteredStatus)?.label ??
    'Status needed'
  const profileHealthGoalSummary =
    healthGoalOptions.find((option) => option.value === formData.healthGoal)?.label ??
    'Goal needed'
  const profileSummaryChips = [
    `${formData.weight || weightPlaceholder} ${formData.weightUnit}`,
    profileAgeSummary,
    profileActivitySummary,
    profileNeuteredSummary,
    profileHealthGoalSummary,
  ]
  const foodSummaryParts = []

  if (formData.hasDryFood && formData.dryFoodCalories) {
    foodSummaryParts.push(`${formData.dryFoodCalories} kcal/kg dry`)
  }

  if (formData.hasWetFood && formData.wetFoodCalories) {
    foodSummaryParts.push(`${formData.wetFoodCalories} ${foodCaloriesUnit} wet`)
  }

  const foodSummary =
    foodSummaryParts.length > 0 ? foodSummaryParts.join(' + ') : 'Not added yet'
  const wetFoodPlaceholder = formData.wetFoodUnit === 'pouch' ? '78' : '185'
  const parsedDryFoodCalories = Number.parseFloat(formData.dryFoodCalories)
  const parsedWetFoodCalories = Number.parseFloat(formData.wetFoodCalories)
  const canUseFoodCalories =
    formData.foodInputMode === 'manual' || formData.foodInputMode === 'database'
  const dryFoodWarningMessage =
    formData.foodInputMode === 'manual' ? getDryFoodCalorieWarning(parsedDryFoodCalories) : ''
  const wetFoodWarningMessage =
    formData.foodInputMode === 'manual'
      ? getWetFoodCalorieWarning(parsedWetFoodCalories, formData.wetFoodUnit)
      : ''
  const wetFoodPortionFraction = wetFoodPortionFractions[formData.wetFoodPortion] ?? null
  const wetFoodCalorieAllowance =
    canUseFoodCalories &&
    formData.hasWetFood &&
    !Number.isNaN(parsedWetFoodCalories) &&
    parsedWetFoodCalories > 0 &&
    wetFoodPortionFraction
      ? parsedWetFoodCalories * wetFoodPortionFraction
      : null
  const dryFoodKcalPerGram =
    canUseFoodCalories &&
    formData.hasDryFood &&
    !Number.isNaN(parsedDryFoodCalories) &&
    parsedDryFoodCalories > 0
      ? parsedDryFoodCalories / 1000
      : null
  const hasSelectedAnyFood = formData.hasDryFood || formData.hasWetFood
  const isSequentialDatabaseFlow =
    formData.foodInputMode === 'database' && formData.hasDryFood && formData.hasWetFood
  const databaseSearchTerms = getSearchTerms(databaseSearchQuery)
  const dryDatabaseSearchTerms = getSearchTerms(dryDatabaseSearchQuery)
  const wetDatabaseSearchTerms = getSearchTerms(wetDatabaseSearchQuery)
  const selectedDatabaseDryProduct =
    foodCatalog.find((product) => product.id === selectedDatabaseDryProductId) ?? null
  const selectedDatabaseWetProduct =
    foodCatalog.find((product) => product.id === selectedDatabaseWetProductId) ?? null
  const filteredDatabaseProducts =
    formData.foodInputMode === 'database' && databaseSearchTerms.length > 0
      ? searchCatalogProducts(
          foodCatalog.filter((product) => {
            const matchesFoodType =
              (product.foodType === 'dry' && formData.hasDryFood) ||
              (product.foodType === 'wet' && formData.hasWetFood)

            return matchesFoodType
          }),
          databaseSearchQuery,
        )
      : []
  const filteredDryDatabaseProducts =
    formData.foodInputMode === 'database' && dryDatabaseSearchTerms.length > 0
      ? searchCatalogProducts(
          foodCatalog.filter((product) => product.foodType === 'dry'),
          dryDatabaseSearchQuery,
        )
      : []
  const filteredWetDatabaseProducts =
    formData.foodInputMode === 'database' && wetDatabaseSearchTerms.length > 0
      ? searchCatalogProducts(
          foodCatalog.filter((product) => product.foodType === 'wet'),
          wetDatabaseSearchQuery,
        )
      : []
  const dryDatabaseResults = selectedDatabaseDryProduct
    ? []
    : (isSequentialDatabaseFlow
        ? filteredDryDatabaseProducts
        : filteredDatabaseProducts.filter((product) => product.foodType === 'dry')
      ).slice(0, 8)
  const wetDatabaseResults = selectedDatabaseWetProduct
    ? []
    : (isSequentialDatabaseFlow
        ? filteredWetDatabaseProducts
        : filteredDatabaseProducts.filter((product) => product.foodType === 'wet')
      ).slice(0, 8)
  const formatSuggestedFeeding = (caloriesPerDay) => {
    if (typeof caloriesPerDay !== 'number' || Number.isNaN(caloriesPerDay)) {
      return 'Add weight to calculate'
    }

    return `${Math.round(caloriesPerDay)} kcal/day`
  }
  const formatSuggestedFeedingRange = (firstCaloriesPerDay, secondCaloriesPerDay) => {
    if (
      typeof firstCaloriesPerDay !== 'number' ||
      Number.isNaN(firstCaloriesPerDay) ||
      typeof secondCaloriesPerDay !== 'number' ||
      Number.isNaN(secondCaloriesPerDay)
    ) {
      return 'Add weight to calculate'
    }

    const [smallerCaloriesPerDay, largerCaloriesPerDay] = [
      firstCaloriesPerDay,
      secondCaloriesPerDay,
    ].sort((left, right) => left - right)

    return `${formatSuggestedFeeding(smallerCaloriesPerDay)} to ${formatSuggestedFeeding(
      largerCaloriesPerDay,
    )}`
  }
  const wetPortionSummary = formData.wetFoodPortion
    ? `${formData.wetFoodPortion} ${formData.wetFoodUnit}`
    : 'Not selected'
  const foodSectionSummary = hasSelectedAnyFood ? foodSummary : 'No foods added yet'
  const summarySnapshotChips = [
    `Calories: ${calorieSummary}`,
    `Food: ${foodSectionSummary}`,
  ]
  const foodChoicePreview = formData.hasDryFood && formData.hasWetFood
    ? {
        src: bowlWithWetAndDryImage,
        alt: 'Bowl with dry and wet food',
      }
    : formData.hasDryFood
      ? {
          src: bowlWithDryImage,
          alt: 'Bowl with dry food',
        }
      : formData.hasWetFood
        ? {
            src: bowlWithWetImage,
            alt: 'Bowl with wet food',
          }
        : {
            src: emptyBowlImage,
            alt: 'Empty bowl',
          };
  const showWetFoodPortionPicker =
    formData.hasWetFood &&
    (formData.foodInputMode !== 'database' || Boolean(selectedDatabaseWetProduct))
  const hasCompleteDryFoodInput =
    !formData.hasDryFood ||
    (canUseFoodCalories &&
      !Number.isNaN(parsedDryFoodCalories) &&
      parsedDryFoodCalories > 0)
  const hasCompleteWetFoodInput =
    !formData.hasWetFood ||
    (canUseFoodCalories &&
      !Number.isNaN(parsedWetFoodCalories) &&
      parsedWetFoodCalories > 0 &&
      Boolean(formData.wetFoodPortion))
  const canGetResult =
    hasSelectedAnyFood && hasCompleteDryFoodInput && hasCompleteWetFoodInput
  const showDryOnlyMenuMaker =
    isProfileComplete &&
    !hasExtremeWeightBlock &&
    formData.hasDryFood &&
    !formData.hasWetFood &&
    canUseFoodCalories &&
    !dryFoodWarningMessage &&
    typeof dryFoodKcalPerGram === 'number' &&
    dryFoodKcalPerGram > 0
  const menuMakerPlans = hasExtremeWeightBlock
    ? []
    : isAdultCat && adultFeedingPlan?.type === 'weight-loss'
      ? [
          { label: 'Week 1-2', calories: adultFeedingPlan.week1to2 },
          { label: 'Week 3+', calories: adultFeedingPlan.week3Plus },
        ]
      : isSeniorCat && seniorFeedingPlan?.type === 'weight-loss'
        ? [
            { label: 'Week 1-2', calories: seniorFeedingPlan.week1to2 },
            { label: 'Week 3+', calories: seniorFeedingPlan.week3Plus },
          ]
        : [
            {
              label: 'Daily Plan',
              calories: isKitten
                ? finalCalories
                : isAdultCat
                  ? adultFeedingPlan?.type === 'standard'
                    ? adultFeedingPlan.dailyAmount
                    : null
                  : isSeniorCat
                    ? seniorFeedingPlan?.type === 'standard'
                      ? seniorFeedingPlan.dailyAmount
                      : null
                    : isGeriatricCat
                      ? geriatricFeedingPlan?.type === 'standard'
                        ? geriatricFeedingPlan.dailyAmount
                        : geriatricFeedingPlan?.type === 'vet-alert'
                          ? geriatricMaintainFeedingPlan?.dailyAmount ?? null
                          : null
                      : null,
            },
          ]
  const menuMakerEntries = menuMakerPlans.map((plan) => {
    const wetProgressPercent =
      typeof plan.calories === 'number' &&
      plan.calories > 0 &&
      typeof wetFoodCalorieAllowance === 'number'
        ? Math.min((wetFoodCalorieAllowance / plan.calories) * 100, 100)
        : 0
    const remainingCalories =
      typeof plan.calories === 'number'
        ? typeof wetFoodCalorieAllowance === 'number'
          ? Math.max(plan.calories - wetFoodCalorieAllowance, 0)
          : formData.hasDryFood && !formData.hasWetFood
            ? plan.calories
            : null
        : null
    const dryProgressPercent =
      typeof plan.calories === 'number' &&
      plan.calories > 0 &&
      typeof remainingCalories === 'number' &&
      formData.hasDryFood
        ? Math.min((remainingCalories / plan.calories) * 100, 100)
        : 0
    const remainingDryGrams =
      typeof remainingCalories === 'number' &&
      typeof dryFoodKcalPerGram === 'number' &&
      dryFoodKcalPerGram > 0
        ? remainingCalories / dryFoodKcalPerGram
        : null

    return {
      ...plan,
      wetProgressPercent,
      remainingCalories,
      dryProgressPercent,
      remainingDryGrams,
    }
  })
  const showMenuMakerProgressCards = formData.hasWetFood || showDryOnlyMenuMaker
  const wetOverfeedTargetCalories =
    menuMakerEntries.length > 0 ? menuMakerEntries[0].calories : null
  const wetOverfeedExtraCalories =
    typeof wetFoodCalorieAllowance === 'number' &&
    typeof wetOverfeedTargetCalories === 'number'
      ? wetFoodCalorieAllowance - wetOverfeedTargetCalories
      : null
  const isMinorWetOverfeed =
    typeof wetOverfeedExtraCalories === 'number' &&
    typeof wetOverfeedTargetCalories === 'number' &&
    wetOverfeedTargetCalories > 0 &&
    wetOverfeedExtraCalories / wetOverfeedTargetCalories < 0.05
  const showWetOverfeedAlertModal =
    formData.hasWetFood &&
    typeof wetFoodCalorieAllowance === 'number' &&
    typeof wetOverfeedTargetCalories === 'number' &&
    wetFoodCalorieAllowance > wetOverfeedTargetCalories &&
    !isWetOverfeedAlertDismissed
  const collapsedSectionWidth = '0.33fr'
  const expandedSectionWidths = {
    overview: '0.95fr',
    profile: '1.15fr',
    food: '1.25fr',
    summary: '0.95fr',
  }
  const sectionStates = {
    overview: !isOverviewCollapsed,
    profile: !isProfileCollapsed,
    food: !isFoodSectionCollapsed,
    summary: !isSummaryCollapsed,
  }
  const expandedSections = Object.entries(sectionStates)
    .filter(([, isExpanded]) => isExpanded)
    .map(([section]) => section)
  const singleExpandedSection = expandedSections.length === 1 ? expandedSections[0] : null
  const appShellStyle = {
    gridTemplateColumns: ['overview', 'profile', 'food', 'summary']
      .map((section) => {
        if (singleExpandedSection) {
          return section === singleExpandedSection ? '3fr' : collapsedSectionWidth
        }

        return sectionStates[section]
          ? expandedSectionWidths[section]
          : collapsedSectionWidth
      })
      .join(' '),
  }
  const renderSectionNav = (section) => {
    const sectionIndex = sectionOrder.indexOf(section)
    const isFirstSection = sectionIndex === 0
    const isLastSection = sectionIndex === sectionOrder.length - 1
    const nextSection = sectionOrder[sectionIndex + 1]
    const isNextDisabled =
      (nextSection === 'food' && !isProfileComplete) ||
      (section === 'food' && !canGetResult)
    const nextButtonLabel = section === 'food' ? 'Get Result' : 'Next step'
    const lastButtonLabel = section === 'profile' ? 'Return' : 'Last step'
    const lastButtonClassName =
      section === 'food'
        ? 'section-nav__button section-nav__button--subtle'
        : 'section-nav__button'

    return (
      <div className="section-nav" aria-label={`${sectionTitles[section]} navigation`}>
        {!isFirstSection ? (
          <button
            type="button"
            className={lastButtonClassName}
            onClick={() => goToAdjacentStep(section, -1)}
          >
            {lastButtonLabel}
          </button>
        ) : (
          <span className="section-nav__spacer" aria-hidden="true"></span>
        )}

        {!isLastSection ? (
          <button
            type="button"
            className={`section-nav__button ${!isNextDisabled ? 'section-nav__button--primary' : ''}`}
            onClick={() => goToAdjacentStep(section, 1)}
            disabled={isNextDisabled}
          >
            {nextButtonLabel}
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <main className="app-shell" style={appShellStyle}>
      {showBirthToWeaningModal ? (
        <div className="modal-backdrop" role="presentation">
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="birth-to-weaning-title"
          >
            <button
              type="button"
              className="modal-close"
              aria-label="Close message"
              onClick={() => setIsBirthToWeaningDismissed(true)}
            >
              ×
            </button>
            <p className="section-kicker">Kitten Feeding Note</p>
            <h2 id="birth-to-weaning-title">Birth to weaning guidance</h2>
            <p>
              🍼 We are currently working on the Birth to Weaning phase of
              kittens. Please consult your vet for milk replacer guidelines.
            </p>
          </div>
        </div>
      ) : null}

      {isWetPortionModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wet-portion-title"
          >
            <button
              type="button"
              className="modal-close"
              aria-label="Close wet food portion picker"
              onClick={() => {
                setIsWetPortionModalOpen(false)
                setShowExpandedWetPortions(false)
              }}
            >
              ×
            </button>
            <p className="section-kicker">Wet Food Portion</p>
            <h2 id="wet-portion-title">Choose the wet food portion fed per day</h2>
            <div
              className="portion-choice-grid"
              role="group"
              aria-label="Wet food portion per day"
            >
              {wetFoodPortionOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`portion-choice-card ${
                    formData.wetFoodPortion === option.value
                      ? 'portion-choice-card--selected'
                      : ''
                  }`}
                  onClick={() => {
                    handleChange({
                      target: {
                        name: 'wetFoodPortion',
                        value: option.value,
                      },
                    })
                    setIsWetPortionModalOpen(false)
                    setShowExpandedWetPortions(false)
                  }}
                >
                  <span
                    className={`portion-chart ${option.chartClass}`}
                    aria-hidden="true"
                  ></span>
                  <span className="portion-choice-card__label">{option.label}</span>
                </button>
              ))}
            </div>
            {!showExpandedWetPortions ? (
              <button
                type="button"
                className="portion-expand-button"
                onClick={() => setShowExpandedWetPortions(true)}
              >
                I feed more than 1 can/pouch per day
              </button>
            ) : null}
            {showExpandedWetPortions ? (
              <div
                className="portion-choice-grid portion-choice-grid--expanded"
                role="group"
                aria-label="Expanded wet food portion per day"
              >
                {wetFoodExpandedPortionOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`portion-choice-card ${
                      formData.wetFoodPortion === option.value
                        ? 'portion-choice-card--selected'
                        : ''
                    }`}
                    onClick={() => {
                      handleChange({
                        target: {
                          name: 'wetFoodPortion',
                          value: option.value,
                        },
                      })
                      setIsWetPortionModalOpen(false)
                      setShowExpandedWetPortions(false)
                    }}
                  >
                    <span
                      className={`portion-chart ${option.chartClass}`}
                      aria-hidden="true"
                    ></span>
                    <span className="portion-choice-card__label">{option.label}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {showRibCheckModal ? (
        <div className="modal-backdrop" role="presentation">
          <div
            className={`modal-card ${hasRibCheckSelection ? 'modal-card--success' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rib-check-title"
          >
            <button
              type="button"
              className="modal-close"
              aria-label="Close rib check"
              disabled={!hasRibCheckSelection}
              onClick={() => setIsRibCheckDismissed(true)}
            >
              ×
            </button>
            <p className="section-kicker">Kitten Growth Check</p>
            <h2 id="rib-check-title">Time for a Rib Check</h2>
            <p>
              {hasRibCheckSelection ? '✅' : '⚠️'} Time for a Rib Check! Rapid
              growth slows down around 10-12 months. If you cannot easily feel
              your cat&apos;s ribs with a light touch, they are gaining fat, not
              bone.
            </p>

            <div className="warning-follow-up">
              <p className="modal-question">
                Can you feel kitty&apos;s ribs with a gentle touch?
              </p>
              <div className="response-button-row" role="group" aria-label="Rib check response">
                {ribCheckResponseOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`response-button ${
                      formData.ribCheckResponse === option.value
                        ? 'response-button--selected'
                        : ''
                    }`}
                    onClick={() =>
                      handleChange({
                        target: {
                          name: 'ribCheckResponse',
                          value: option.value,
                        },
                      })
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {hasRibCheckSelection ? (
                <p className="modal-confirmation">
                  Thank you for your selection! You may close this window now!
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {showGeriatricVetAlertModal ? (
        <div className="modal-backdrop" role="presentation">
          <div
            className={`modal-card modal-card--danger ${
              hasConfirmedGeriatricVetAlert ? 'modal-card--danger-confirmed' : ''
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="geriatric-vet-alert-title"
          >
            <button
              type="button"
              className="modal-close modal-close--danger"
              aria-label="Close vet alert"
              disabled={!hasConfirmedGeriatricVetAlert}
              onClick={() => setIsGeriatricVetAlertDismissed(true)}
            >
              ×
            </button>
            <p className="section-kicker">Geriatric Safety Guardrail</p>
            <h2 id="geriatric-vet-alert-title">Vet Alert</h2>
            <p className="modal-danger-copy">
              🛑 VET ALERT: Cats over 12 years old naturally lose muscle mass
              and struggle to absorb nutrients. Intentional weight loss at this
              age is highly dangerous without a vet&apos;s direct supervision.
              Unexplained weight changes in senior cats are often signs of
              thyroid or kidney disease. Please consult your veterinarian first!
            </p>
            <button
              type="button"
              className="danger-confirm-button"
              onClick={() => {
                setHasConfirmedGeriatricVetAlert(true)
                setIsGeriatricVetAlertDismissed(true)
              }}
            >
              I Understand
            </button>
          </div>
        </div>
      ) : null}

      {showKittenWeightLossAlertModal ? (
        <div className="modal-backdrop" role="presentation">
          <div
            className="modal-card modal-card--warning"
            role="dialog"
            aria-modal="true"
            aria-labelledby="kitten-weight-loss-title"
          >
            <button
              type="button"
              className="modal-close"
              aria-label="Close kitten weight loss warning"
              onClick={() => setIsKittenWeightLossAlertDismissed(true)}
            >
              ×
            </button>
            <p className="section-kicker">Kitten Growth Guardrail</p>
            <h2 id="kitten-weight-loss-title">Weight loss needs extra caution</h2>
            <p className="modal-warning-copy">
              🐈 Your kitten is nearly an adult but may still be technically growing.
              We recommend keeping weight loss very gradual. Consult your vet before
              starting a strict diet to ensure their bones and muscles have the fuel
              they need to finish strong!
            </p>
          </div>
        </div>
      ) : null}

      {showWetOverfeedAlertModal ? (
        <div className="modal-backdrop" role="presentation">
          <div
            className="modal-card modal-card--warning"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wet-overfeed-title"
          >
            <button
              type="button"
              className="modal-close"
              aria-label="Close wet food warning"
              onClick={() => setIsWetOverfeedAlertDismissed(true)}
            >
              ×
            </button>
            <p className="section-kicker">Wet Food Guardrail</p>
            {isMinorWetOverfeed ? (
              <>
                <h2 id="wet-overfeed-title">Almost a perfect match! 🤏</h2>
                <p className="modal-warning-copy">
                  Your current plan is just a tiny bit over the recommended daily
                  calories. It&apos;s about the equivalent of one extra treat!
                </p>
                <p className="modal-warning-copy">
                  While it&apos;s not a major overload, keeping it closer to the
                  target will help your cat stay in peak &quot;zoomie&quot; condition. 🐾
                </p>
              </>
            ) : (
              <>
                <h2 id="wet-overfeed-title">Wet food exceeds the daily target</h2>
                <p className="modal-warning-copy">
                  {`Wait a second! Based on our calculations, your cat needs about ${Math.round(
                    wetOverfeedTargetCalories,
                  )} kcal a day. But just the wet food you entered adds up to ${Math.round(
                    wetFoodCalorieAllowance,
                  )} kcal, that is ${Math.round(wetOverfeedExtraCalories)} kcal over their limit! 📈`}
                </p>
                <p className="modal-warning-copy">
                  The Risk Warning:
                </p>
                <p className="modal-warning-copy">
                  Feeding this much consistently puts your cat at a high risk for
                  feline obesity, which can lead to diabetes and joint pain. To keep
                  your house panther leaping, we recommend reducing the wet food
                  portions.
                </p>
              </>
            )}
          </div>
        </div>
      ) : null}

      <section
        className={`hero-panel ${isOverviewCollapsed ? 'panel--collapsed' : ''}`}
        aria-labelledby="overview-title"
      >
        <div className="section-panel__header">
          <div>
            <p className="eyebrow">Cat Feeding Calculator</p>
            <h1 id="overview-title">Build a feeding plan around your cat, not a generic chart.</h1>
          </div>
        </div>

        {isOverviewCollapsed ? (
          <div id="overview-body" className="profile-summary-strip" role="status">
            <span className="profile-summary-chip">Overview</span>
          </div>
        ) : (
          <div id="overview-body">
            <p className="hero-copy">
              🐾 We use vet-approved science and customized data to calculate your
              cat&apos;s exact caloric needs. No more guessing, just an accurate
              feeding guide built to help your cat thrive!
            </p>

            <button
              type="button"
              className="status-strip status-strip--action"
              aria-label="Get start"
              onClick={() => goToAdjacentStep('overview', 1)}
            >
              <span>Get start</span>
            </button>
          </div>
        )}
      </section>

      <section
        className={`input-bar ${isProfileCollapsed ? 'panel--collapsed' : ''}`}
        aria-labelledby="input-bar-title"
        onClick={(event) => {
          if (!isProfileCollapsed) {
            return
          }

          if (isInteractiveElement(event.target)) {
            return
          }

          setHasStartedStepOne(true)
          focusSection('profile')
        }}
      >
        <div className="section-panel__header">
          <div>
            <p className="section-kicker">Step 1</p>
            <h2 id="input-bar-title">Cat profile</h2>
          </div>
          <div className="section-panel__header-meta">
            <p className="section-copy">
              Enter the basics to personalize the feeding calculator.
            </p>
          </div>
        </div>

        <div id="profile-form-panel">
          {isProfileCollapsed ? (
            <div className="profile-summary-strip" role="status" aria-label="Collapsed cat profile">
              <span className="profile-summary-chip">Step 1 Cat Profile</span>
            </div>
          ) : (
            <>
              <form className="profile-form">
                <label className="field">
                  <span>Cat Weight</span>
                  <div className="input-with-unit input-with-unit--weight">
                    <input
                      className="weight-input"
                      type="number"
                      name="weight"
                      min="0"
                      step="0.1"
                      placeholder={weightPlaceholder}
                      value={formData.weight}
                      onChange={handleChange}
                    />
                    <select
                      className="unit-select"
                      name="weightUnit"
                      value={formData.weightUnit}
                      onChange={handleChange}
                      aria-label="Weight unit"
                    >
                      {weightUnitOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {weightWarningMessage ? (
                    <div className="field-warning" role="status">
                      {weightWarningMessage}
                    </div>
                  ) : null}
                </label>

                <label className="field">
                  <span>Cat Age</span>
                  <div className="input-with-unit">
                    <select name="age" value={formData.age} onChange={handleChange}>
                      {ageOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <span>Year(s)</span>
                  </div>
                </label>

                {formData.age === 'less-than-1' ? (
                  <div className="field">
                    <span>Kitten Age (Months)</span>
                    <select
                      name="kittenAgeMonths"
                      value={formData.kittenAgeMonths}
                      onChange={handleChange}
                    >
                      {kittenMonthOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                <label className="field">
                  <span>Activity Level</span>
                  <select
                    name="activityLevel"
                    value={formData.activityLevel}
                    onChange={handleChange}
                  >
                    {activityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Neutered Status</span>
                  <select
                    name="neuteredStatus"
                    value={formData.neuteredStatus}
                    onChange={handleChange}
                  >
                    {neuteredOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field field--full">
                  <span>Health Goal</span>
                  <select
                    name="healthGoal"
                    value={formData.healthGoal}
                    onChange={handleChange}
                  >
                    {healthGoalOptions
                      .filter((option) => !(isYoungKitten && option.value === 'lose'))
                      .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                      ))}
                  </select>
                </label>
              </form>
              {renderSectionNav('profile')}
            </>
          )}
        </div>
      </section>

      <section
        className={`food-panel ${isFoodSectionCollapsed ? 'panel--collapsed' : ''}`}
        aria-labelledby="food-panel-title"
      >
        <div className="section-panel__header">
            <div>
            <p className="section-kicker">Step 2</p>
            <h2 id="food-panel-title">What&apos;s on the menu for your cat?</h2>
            </div>
          <div className="section-panel__header-meta">
            <p className="section-copy">
              Search our MVP catalog or enter calorie details manually.
            </p>
          </div>
        </div>

        {!hasEnteredFoodSection ? (
          <div className="section-locked-note" role="status">
            {isProfileComplete
              ? 'Your cat profile is ready. Head back to Step 1 and click Next step to open food input.'
              : `Finish Step 1 first${incompleteProfileSummary ? `: ${incompleteProfileSummary}.` : '.'}`}
          </div>
        ) : isFoodSectionCollapsed ? (
          <div id="food-panel-body" className="profile-summary-strip" role="status">
            <span className="profile-summary-chip">Step 2 Food Details</span>
          </div>
        ) : (
          <div id="food-panel-body">
          {showIncompleteProfileReminder ? (
            <div className="field-warning food-panel__warning" role="status">
              Finish the cat profile before food input can be fully accurate.
              {incompleteProfileSummary
                ? ` Still missing: ${incompleteProfileSummary}.`
                : ''}
            </div>
          ) : null}

          <div className="food-manual-card">
            <div className="food-choice-header">
              <div>
                <p className="food-choice-title">What&apos;s on the menu for your cat?</p>
                <p className="food-choice-copy">Choose one or both.</p>
              </div>
              <img
                className="food-choice-preview"
                src={foodChoicePreview.src}
                alt={foodChoicePreview.alt}
              />
            </div>

            <div className="food-choice-grid">
              {foodChoiceCards.map((option) => {
                const stateKey =
                  option.value === 'dry' ? 'hasDryFood' : 'hasWetFood'

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`food-choice-card ${
                      formData[stateKey] ? 'food-choice-card--selected' : ''
                    }`}
                    onClick={() =>
                      handleChange({
                        target: {
                          name: 'foodChoice',
                          value: stateKey,
                        },
                      })
                    }
                  >
                    <span className="food-choice-card__label">{option.label}</span>
                    <span className="food-choice-card__copy">
                      {option.description}
                    </span>
                  </button>
                )
              })}
            </div>

            {hasSelectedAnyFood ? (
              <>
                <div
                  className="food-mode-switch"
                  role="tablist"
                  aria-label="Food input mode"
                >
                  {foodModeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="tab"
                      aria-selected={formData.foodInputMode === option.value}
                      className={`food-mode-card ${
                        formData.foodInputMode === option.value
                          ? 'food-mode-card--active'
                          : ''
                      } ${option.isDisabled ? 'food-mode-card--disabled' : ''}`}
                      disabled={option.isDisabled}
                      onClick={() =>
                        handleChange({
                          target: {
                            name: 'foodInputMode',
                            value: option.value,
                          },
                        })
                      }
                      title={option.hint}
                    >
                      <span className="food-mode-card__label">{option.label}</span>
                      <span className="food-mode-card__hint">{option.hint}</span>
                    </button>
                  ))}
                </div>

                {formData.foodInputMode === 'database' ? (
                  <div className="database-search-panel">
                    {isSequentialDatabaseFlow ? (
                      <div className="database-search-stack">
                        <div className="database-search-stage">
                          <label className="field field--full">
                            <span>Search for Dry Food</span>
                            <input
                              type="search"
                              value={dryDatabaseSearchQuery}
                              onChange={(event) => setDryDatabaseSearchQuery(event.target.value)}
                              placeholder="Search dry food by brand or product name"
                            />
                          </label>

                          {selectedDatabaseDryProduct ? (
                            <div className="database-selection-cart" role="status" aria-live="polite">
                              <div className="database-selection-cart__header">
                                <p className="database-selection-cart__title">Selected dry food</p>
                                <p className="database-selection-cart__copy">
                                  This dry food is already applied to the calculator.
                                </p>
                              </div>

                              <div className="database-selection-cart__items">
                                <div className="database-selection-chip">
                                  <div className="database-selection-chip__layout">
                                    <ProductThumbnail product={selectedDatabaseDryProduct} />
                                    <div className="database-selection-chip__body">
                                      <div className="database-selection-chip__header">
                                        <span className="database-selection-chip__type">
                                          Dry Kibble
                                        </span>
                                        <div className="database-selection-chip__actions">
                                          <button
                                            type="button"
                                            className="database-selection-chip__remove"
                                            onClick={() => removeDatabaseProduct('dry')}
                                          >
                                            Change selection
                                          </button>
                                        </div>
                                      </div>
                                      <span className="database-selection-chip__name">
                                        {selectedDatabaseDryProduct.productName}
                                      </span>
                                      <span className="database-selection-chip__meta">
                                        {selectedDatabaseDryProduct.brand} •{' '}
                                        {getFoodCatalogCaloriesLabel(selectedDatabaseDryProduct)} applied
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : null}

                          {selectedDatabaseDryProduct ? null : dryDatabaseSearchTerms.length === 0 ? (
                            <div className="database-search-empty" role="status">
                              Start typing a brand or product name to browse the dry food database.
                            </div>
                          ) : dryDatabaseResults.length === 0 ? (
                            <div className="database-search-empty" role="status">
                              No dry food matches yet. Try another brand, flavor, or product keyword.
                            </div>
                          ) : (
                            <div className="database-search-group">
                              <div className="database-search-results">
                                {dryDatabaseResults.map((product) => (
                                  <button
                                    key={product.id}
                                    type="button"
                                    className={`database-result-card ${
                                      selectedDatabaseDryProductId === product.id
                                        ? 'database-result-card--selected'
                                        : ''
                                    }`}
                                    onClick={() => applyDatabaseProduct(product)}
                                  >
                                    <div className="database-result-card__layout">
                                      <ProductThumbnail product={product} />
                                      <div className="database-result-card__body">
                                        <span className="database-result-card__brand">
                                          {product.brand}
                                        </span>
                                        <span className="database-result-card__name">
                                          {product.productName}
                                        </span>
                                        <span className="database-result-card__meta">
                                          {getFoodCatalogCaloriesLabel(product)}
                                        </span>
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div
                          className={`database-search-stage database-search-stage--wet ${
                            selectedDatabaseDryProduct
                              ? 'database-search-stage--revealed'
                              : ''
                          }`}
                        >
                          <label className="field field--full">
                            <span>Search for Wet Food</span>
                            <input
                              type="search"
                              value={wetDatabaseSearchQuery}
                              onChange={(event) => setWetDatabaseSearchQuery(event.target.value)}
                              placeholder="Search wet food by brand or product name"
                            />
                          </label>

                          {selectedDatabaseWetProduct ? (
                            <div className="database-selection-cart" role="status" aria-live="polite">
                              <div className="database-selection-cart__header">
                                <p className="database-selection-cart__title">Selected wet food</p>
                                <p className="database-selection-cart__copy">
                                  This wet food is already applied to the calculator.
                                </p>
                              </div>

                              <div className="database-selection-cart__items">
                                <div className="database-selection-chip">
                                  <div className="database-selection-chip__layout">
                                    <ProductThumbnail product={selectedDatabaseWetProduct} />
                                    <div className="database-selection-chip__body">
                                      <div className="database-selection-chip__header">
                                        <span className="database-selection-chip__type">
                                          Wet Food
                                        </span>
                                        <button
                                          type="button"
                                          className="database-selection-chip__remove"
                                          onClick={() => removeDatabaseProduct('wet')}
                                        >
                                          Change selection
                                        </button>
                                      </div>
                                      <span className="database-selection-chip__name">
                                        {selectedDatabaseWetProduct.productName}
                                      </span>
                                      <span className="database-selection-chip__meta">
                                        {selectedDatabaseWetProduct.brand} •{' '}
                                        {getFoodCatalogCaloriesLabel(selectedDatabaseWetProduct)} applied
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : null}

                          {selectedDatabaseDryProduct ? (
                            wetDatabaseSearchTerms.length === 0 ? (
                              <div className="database-search-empty" role="status">
                                Start typing a brand or product name to browse the wet food database.
                              </div>
                            ) : !selectedDatabaseWetProduct && wetDatabaseResults.length === 0 ? (
                              <div className="database-search-empty" role="status">
                                No wet food matches yet. Try another brand, flavor, or product keyword.
                              </div>
                            ) : (
                              <div className="database-search-group">
                                <div className="database-search-results">
                                  {wetDatabaseResults.map((product) => (
                                    <button
                                      key={product.id}
                                      type="button"
                                      className={`database-result-card ${
                                        selectedDatabaseWetProductId === product.id
                                          ? 'database-result-card--selected'
                                          : ''
                                      }`}
                                      onClick={() => applyDatabaseProduct(product)}
                                    >
                                      <div className="database-result-card__layout">
                                        <ProductThumbnail product={product} />
                                        <div className="database-result-card__body">
                                          <span className="database-result-card__brand">
                                            {product.brand}
                                          </span>
                                          <span className="database-result-card__name">
                                            {product.productName}
                                          </span>
                                          <span className="database-result-card__meta">
                                            {getFoodCatalogCaloriesLabel(product)}
                                          </span>
                                        </div>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )
                          ) : (
                            <div className="database-search-empty" role="status">
                              Select a dry food first, then the wet food search will open here.
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <label className="field field--full">
                          <span>Search food database</span>
                          <input
                            type="search"
                            value={databaseSearchQuery}
                            onChange={(event) => setDatabaseSearchQuery(event.target.value)}
                            placeholder="Search by brand or product name"
                          />
                        </label>

                        {selectedDatabaseDryProduct || selectedDatabaseWetProduct ? (
                          <div className="database-selection-cart" role="status" aria-live="polite">
                            <div className="database-selection-cart__header">
                              <p className="database-selection-cart__title">Added to calculation</p>
                              <p className="database-selection-cart__copy">
                                Selected database items are already applied to the calculator.
                              </p>
                            </div>

                            <div className="database-selection-cart__items">
                              {selectedDatabaseDryProduct ? (
                                <div className="database-selection-chip">
                                  <div className="database-selection-chip__layout">
                                    <ProductThumbnail product={selectedDatabaseDryProduct} />
                                    <div className="database-selection-chip__body">
                                      <div className="database-selection-chip__header">
                                        <span className="database-selection-chip__type">
                                          Dry Kibble
                                        </span>
                                        <button
                                          type="button"
                                          className="database-selection-chip__remove"
                                          onClick={() => removeDatabaseProduct('dry')}
                                        >
                                          Remove
                                        </button>
                                      </div>
                                      <span className="database-selection-chip__name">
                                        {selectedDatabaseDryProduct.productName}
                                      </span>
                                      <span className="database-selection-chip__meta">
                                        {selectedDatabaseDryProduct.brand} •{' '}
                                        {getFoodCatalogCaloriesLabel(selectedDatabaseDryProduct)} applied
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ) : null}

                              {selectedDatabaseWetProduct ? (
                                <div className="database-selection-chip">
                                  <div className="database-selection-chip__layout">
                                    <ProductThumbnail product={selectedDatabaseWetProduct} />
                                    <div className="database-selection-chip__body">
                                      <div className="database-selection-chip__header">
                                        <span className="database-selection-chip__type">
                                          Wet Food
                                        </span>
                                        <button
                                          type="button"
                                          className="database-selection-chip__remove"
                                          onClick={() => removeDatabaseProduct('wet')}
                                        >
                                          Remove
                                        </button>
                                      </div>
                                      <span className="database-selection-chip__name">
                                        {selectedDatabaseWetProduct.productName}
                                      </span>
                                      <span className="database-selection-chip__meta">
                                        {selectedDatabaseWetProduct.brand} •{' '}
                                        {getFoodCatalogCaloriesLabel(selectedDatabaseWetProduct)} applied
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        ) : null}

                        {databaseSearchTerms.length === 0 ? (
                          <div className="database-search-empty" role="status">
                            Start typing a brand or product name to browse the MVP catalog.
                          </div>
                        ) : !selectedDatabaseDryProduct &&
                          !selectedDatabaseWetProduct &&
                          dryDatabaseResults.length === 0 &&
                          wetDatabaseResults.length === 0 ? (
                          <div className="database-search-empty" role="status">
                            No matches yet. Try another brand, flavor, or product keyword.
                          </div>
                        ) : (
                          <div className="database-search-groups">
                            {formData.hasDryFood && dryDatabaseResults.length > 0 ? (
                              <div className="database-search-group">
                                <p className="database-search-group__title">Dry Kibble</p>
                                <div className="database-search-results">
                                  {dryDatabaseResults.map((product) => (
                                    <button
                                      key={product.id}
                                      type="button"
                                      className={`database-result-card ${
                                        selectedDatabaseDryProductId === product.id
                                          ? 'database-result-card--selected'
                                          : ''
                                      }`}
                                      onClick={() => applyDatabaseProduct(product)}
                                    >
                                      <div className="database-result-card__layout">
                                        <ProductThumbnail product={product} />
                                        <div className="database-result-card__body">
                                          <span className="database-result-card__brand">
                                            {product.brand}
                                          </span>
                                          <span className="database-result-card__name">
                                            {product.productName}
                                          </span>
                                          <span className="database-result-card__meta">
                                            {getFoodCatalogCaloriesLabel(product)}
                                          </span>
                                          {selectedDatabaseDryProductId === product.id ? (
                                            <span className="database-result-card__applied">
                                              Added to calculation
                                            </span>
                                          ) : null}
                                        </div>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : null}

                            {formData.hasWetFood && wetDatabaseResults.length > 0 ? (
                              <div className="database-search-group">
                                <p className="database-search-group__title">Wet Food</p>
                                <div className="database-search-results">
                                  {wetDatabaseResults.map((product) => (
                                    <button
                                      key={product.id}
                                      type="button"
                                      className={`database-result-card ${
                                        selectedDatabaseWetProductId === product.id
                                          ? 'database-result-card--selected'
                                          : ''
                                      }`}
                                      onClick={() => applyDatabaseProduct(product)}
                                    >
                                      <div className="database-result-card__layout">
                                        <ProductThumbnail product={product} />
                                        <div className="database-result-card__body">
                                          <span className="database-result-card__brand">
                                            {product.brand}
                                          </span>
                                          <span className="database-result-card__name">
                                            {product.productName}
                                          </span>
                                          <span className="database-result-card__meta">
                                            {getFoodCatalogCaloriesLabel(product)}
                                          </span>
                                          {selectedDatabaseWetProductId === product.id ? (
                                            <span className="database-result-card__applied">
                                              Added to calculation
                                            </span>
                                          ) : null}
                                        </div>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        )}
                      </>
                    )}

                    {showWetFoodPortionPicker ? (
                      <div className="field field--full">
                        <span>Wet food portion fed per day</span>
                        <button
                          type="button"
                          className="portion-trigger"
                          onClick={() => setIsWetPortionModalOpen(true)}
                        >
                          <span className="portion-trigger__label">
                            {formData.wetFoodPortion
                              ? `Selected: ${formData.wetFoodPortion} ${formData.wetFoodUnit}`
                              : 'Select wet food portion'}
                          </span>
                          <span className="portion-trigger__hint">
                            Open pie chart selector
                          </span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="food-manual-grid">
                    {formData.hasDryFood ? (
                      <label className="field">
                        <span>Dry Food Calories</span>
                        <div className="input-with-unit">
                          <input
                            type="number"
                            name="dryFoodCalories"
                            min="0"
                            step="0.1"
                            placeholder="3800"
                            value={formData.dryFoodCalories}
                            onChange={handleChange}
                          />
                          <span>kcal/kg</span>
                        </div>
                        {dryFoodWarningMessage ? (
                          <div className="field-warning" role="status">
                            {dryFoodWarningMessage}
                          </div>
                        ) : null}
                      </label>
                    ) : null}

                      {showWetFoodPortionPicker ? (
                        <>
                          <label className="field">
                            <span>Wet Food Calories</span>
                          <div className="input-with-unit input-with-unit--wet">
                            <input
                              type="number"
                              name="wetFoodCalories"
                              min="0"
                              step="0.1"
                              placeholder={wetFoodPlaceholder}
                              value={formData.wetFoodCalories}
                              onChange={handleChange}
                            />
                            <select
                              className="unit-select"
                              name="wetFoodUnit"
                              value={formData.wetFoodUnit}
                              onChange={handleChange}
                              aria-label="Wet food unit"
                            >
                              {wetFoodUnitOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          {wetFoodWarningMessage ? (
                            <div className="field-warning" role="status">
                              {wetFoodWarningMessage}
                            </div>
                          ) : null}
                        </label>
                        <div className="field field--full">
                          <span>Wet food portion fed per day</span>
                          <button
                            type="button"
                            className="portion-trigger"
                            onClick={() => setIsWetPortionModalOpen(true)}
                          >
                            <span className="portion-trigger__label">
                              {formData.wetFoodPortion
                                ? `Selected: ${formData.wetFoodPortion} ${formData.wetFoodUnit}`
                                : 'Select wet food portion'}
                            </span>
                            <span className="portion-trigger__hint">
                              Open pie chart selector
                            </span>
                          </button>
                        </div>
                      </>
                    ) : null}
                  </div>
                )}
              </>
            ) : null}
            {renderSectionNav('food')}
          </div>
          </div>
        )}
      </section>

      <aside
        className={`summary-panel ${isSummaryCollapsed ? 'panel--collapsed' : ''}`}
        aria-label="Meal plan summary"
      >
        <div className="section-panel__header">
          <div>
            <p className="section-kicker">Meal Plan</p>
            <h2>Meal Plan for Your Cat</h2>
          </div>
          <div className="section-panel__header-meta">
            <p className="section-copy">
              Your feeding recommendation updates as the profile and food details change.
            </p>
          </div>
        </div>

        {isSummaryCollapsed ? (
          <div id="summary-panel-body" className="profile-summary-strip" role="status">
            <span className="profile-summary-chip">Meal Plan</span>
          </div>
        ) : (
          <div id="summary-panel-body">
        <dl className="summary-grid">
          {isAdultCat || isSeniorCat || isGeriatricCat ? (
            <div>
              <dt>Suggested Feeding</dt>
              <dd>
                {hasExtremeWeightBlock
                  ? 'Blocked until weight is corrected'
                  : (isAdultCat
                        ? adultFeedingPlan
                        : isSeniorCat
                          ? seniorFeedingPlan
                          : geriatricFeedingPlan)?.type === 'standard'
                  ? formatSuggestedFeeding(
                      (
                        isAdultCat
                          ? adultFeedingPlan
                          : isSeniorCat
                            ? seniorFeedingPlan
                            : geriatricFeedingPlan
                      ).dailyAmount,
                    )
                  : (isAdultCat
                        ? adultFeedingPlan
                        : isSeniorCat
                          ? seniorFeedingPlan
                          : geriatricFeedingPlan)?.type === 'weight-loss'
                    ? formatSuggestedFeedingRange(
                        (isAdultCat ? adultFeedingPlan : seniorFeedingPlan).week1to2,
                        (isAdultCat ? adultFeedingPlan : seniorFeedingPlan).week3Plus,
                      )
                    : isGeriatricCat &&
                        geriatricFeedingPlan?.type === 'vet-alert'
                      ? geriatricMaintainFeedingPlan?.dailyAmount
                        ? `${formatSuggestedFeeding(geriatricMaintainFeedingPlan.dailyAmount)} to maintain weight`
                        : 'Add weight to calculate'
                      : 'Add weight to calculate'}
              </dd>
            </div>
          ) : null}
        </dl>

        {typeof wetOverfeedExtraCalories === 'number' && wetOverfeedExtraCalories > 0 ? (
          <div
            className={`meal-plan-alert ${
              isMinorWetOverfeed ? 'meal-plan-alert--gentle' : 'meal-plan-alert--warning'
            }`}
            role="status"
          >
            <p className="meal-plan-alert__title">
              {isMinorWetOverfeed
                ? 'Almost a perfect match! 🤏'
                : 'Wet food alone is above the daily calorie target'}
            </p>
            <p>
              {isMinorWetOverfeed
                ? `The wet food plan is about ${Math.round(wetOverfeedExtraCalories)} kcal over the target. It is a very small overage, but tightening it up will keep the plan closer to your cat's ideal range.`
                : `The selected wet food adds about ${Math.round(
                    wetFoodCalorieAllowance,
                  )} kcal per day, which is ${Math.round(
                    wetOverfeedExtraCalories,
                  )} kcal above the suggested daily amount. Consider reducing the wet portion or adjusting the plan before following this menu.`}
            </p>
          </div>
        ) : null}

        {showMenuMakerProgressCards
          ? menuMakerEntries.map((entry) => (
              <div
                key={entry.label}
                className="progress-card"
                role="status"
                aria-live="polite"
              >
                <div className="progress-card__header">
                  <p className="progress-card__title">The Menu Maker</p>
                  <span className="progress-card__phase">{entry.label}</span>
                </div>
                <div className="progress-card__bar">
                  <div className="progress-card__segments">
                    {formData.hasWetFood ? (
                      <div
                        className="progress-card__fill progress-card__fill--wet"
                        style={{ width: `${entry.wetProgressPercent}%` }}
                      ></div>
                    ) : null}
                    {formData.hasDryFood ? (
                      <div
                        className="progress-card__fill progress-card__fill--dry"
                        style={{ width: `${entry.dryProgressPercent}%` }}
                      ></div>
                    ) : null}
                  </div>
                </div>
                <div className="progress-card__stats">
                  {formData.hasWetFood ? (
                    <span className="progress-card__stat progress-card__stat--wet">
                      {formData.wetFoodPortion
                        ? `${formData.wetFoodPortion} ${formData.wetFoodUnit} from wet food`
                        : 'Add wet calories and portion'}
                    </span>
                  ) : null}
                  <span className="progress-card__stat progress-card__stat--dry">
                    {formData.hasDryFood && !formData.hasWetFood
                      ? typeof entry.remainingDryGrams === 'number'
                        ? `${Math.round(entry.remainingDryGrams)} g dry food per day`
                        : 'Waiting for suggested feeding'
                      : typeof entry.remainingDryGrams === 'number'
                        ? `${Math.round(entry.remainingDryGrams)} g dry food remaining`
                      : typeof entry.remainingCalories === 'number'
                        ? `${Math.round(entry.remainingCalories)} kcal remaining`
                        : 'Waiting for suggested feeding'}
                  </span>
                </div>
              </div>
            ))
          : null}

        {!hasExtremeWeightBlock &&
        isGeriatricCat &&
        formData.healthGoal === 'lose' &&
        geriatricFeedingPlan?.type === 'vet-alert' ? (
          <div className="info-box" role="note">
            <p className="info-box__title">A Note on Senior Care 12+: 🐾</p>
            <p>
              For geriatric cats (cats over 12 years old), weight management is
              delicate. Sudden calorie restriction can mask or complicate
              underlying health issues common in golden years. We have provided
              a maintenance plan, but please consult your vet before starting
              any weight loss regimen for your cat.
            </p>
          </div>
        ) : null}

        {!hasExtremeWeightBlock &&
        (showKittenGrowthFirstNote ? (
          <div className="info-box" role="note">
            <p className="info-box__title">🐾 Growth First!</p>
            <p>
              Since your kitten is still in their big development phase, we&apos;ve
              calculated a specialized maintenance plan to fuel their growing bones
              and muscles.
            </p>
            <p>
              Professional weight loss programs are reserved for adult cats (1 year+).
              If you&apos;re concerned about their current weight, your vet is the best
              partner to create a custom growth-safe strategy.
            </p>
          </div>
        ) : null)}

        {!hasExtremeWeightBlock &&
        ((isAdultCat && adultFeedingPlan?.type === 'weight-loss') ||
        (isSeniorCat && seniorFeedingPlan?.type === 'weight-loss') ? (
          <div className="info-box" role="note">
            <p className="info-box__title">💡Safe Weight Loss Plan</p>
            <p>
              Week 1-2: Feed{' '}
              {(isAdultCat ? adultFeedingPlan : seniorFeedingPlan).week1to2.toFixed(1)}{' '}
              kcal/day.
            </p>
            <p>
              Week 3+: Feed{' '}
              {(isAdultCat ? adultFeedingPlan : seniorFeedingPlan).week3Plus.toFixed(1)}{' '}
              kcal/day.
            </p>
            <p>
              Why gradual? Cats process fat differently than humans. A sudden
              drop in food can lead to dangerous fatty liver disease. Safe
              dieting is happy dieting!
            </p>
          </div>
        ) : null)}
            {renderSectionNav('summary')}
          </div>
        )}
      </aside>
    </main>
  )
}

export default App
