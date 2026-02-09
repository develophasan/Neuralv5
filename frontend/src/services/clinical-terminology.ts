/**
 * 🧬 CLINICAL TERMINOLOGY LAYER
 * 
 * Maps domain codes to clinical/academic terminology.
 * Used in pitch decks, reports, and professional communication.
 */

export interface ClinicalTerm {
  code: string
  clinicalName: string
  academicName: string
  parentFriendlyName: string
  description: string
  evidenceSource: string
  scaleUsed: string
}

export const CLINICAL_TERMINOLOGY: Record<string, ClinicalTerm> = {
  executive_functions: {
    code: 'executive_functions',
    clinicalName: 'Executive Functioning (Inhibitory Control)',
    academicName: 'Executive Function Development',
    parentFriendlyName: 'Yürütücü İşlevler',
    description: 'Cognitive processes that enable goal-directed behavior, including working memory, cognitive flexibility, and inhibitory control.',
    evidenceSource: 'Diamond, A. (2013). Executive functions. Annual Review of Psychology, 64, 135-168.',
    scaleUsed: 'Bayley-III, BRIEF-P',
  },
  language_communication: {
    code: 'language_communication',
    clinicalName: 'Receptive and Expressive Language Development',
    academicName: 'Linguistic Competence',
    parentFriendlyName: 'Dil ve İletişim',
    description: 'The ability to understand and produce language, including vocabulary, grammar, and pragmatic communication skills.',
    evidenceSource: 'Bates, E., et al. (1995). Individual differences and their implications for theories of language development.',
    scaleUsed: 'CDI, PLS-5',
  },
  social_emotional: {
    code: 'social_emotional',
    clinicalName: 'Social-Emotional Competence',
    academicName: 'Socioemotional Development',
    parentFriendlyName: 'Sosyal ve Duygusal',
    description: 'The ability to understand and manage emotions, form relationships, and navigate social situations.',
    evidenceSource: 'Denham, S. A. (2006). Social-emotional competence as support for school readiness.',
    scaleUsed: 'ASQ:SE, DECA',
  },
  gross_motor: {
    code: 'gross_motor',
    clinicalName: 'Gross Motor Development',
    academicName: 'Locomotor Skills',
    parentFriendlyName: 'Kaba Motor',
    description: 'Large muscle movements including crawling, walking, running, jumping, and balance.',
    evidenceSource: 'Gallahue, D. L., & Ozmun, J. C. (2006). Understanding motor development.',
    scaleUsed: 'PDMS-2, Bayley-III Motor Scale',
  },
  fine_motor: {
    code: 'fine_motor',
    clinicalName: 'Fine Motor Development',
    academicName: 'Manipulative Skills',
    parentFriendlyName: 'İnce Motor',
    description: 'Small muscle movements including grasping, writing, drawing, and tool use.',
    evidenceSource: 'Case-Smith, J. (2006). Fine motor outcomes in preschool children.',
    scaleUsed: 'PDMS-2, VMI',
  },
  logical_numerical: {
    code: 'logical_numerical',
    clinicalName: 'Numerical Cognition',
    academicName: 'Mathematical Thinking',
    parentFriendlyName: 'Mantıksal ve Sayısal',
    description: 'Understanding of numbers, quantities, patterns, and logical relationships.',
    evidenceSource: 'Dehaene, S. (2011). The number sense: How the mind creates mathematics.',
    scaleUsed: 'TEMA-3, WJ-IV',
  },
  creative_expression: {
    code: 'creative_expression',
    clinicalName: 'Creative Expression',
    academicName: 'Divergent Thinking',
    parentFriendlyName: 'Yaratıcı İfade',
    description: 'The ability to generate novel ideas, express creativity through art and play, and think flexibly.',
    evidenceSource: 'Runco, M. A. (2004). Creativity. Annual Review of Psychology, 55, 657-687.',
    scaleUsed: 'TTCT, Torrance Tests',
  },
  spatial_awareness: {
    code: 'spatial_awareness',
    clinicalName: 'Spatial Cognition',
    academicName: 'Spatial Reasoning',
    parentFriendlyName: 'Mekansal Farkındalık',
    description: 'Understanding of spatial relationships, object manipulation, and navigation.',
    evidenceSource: 'Newcombe, N. S., & Huttenlocher, J. (2000). Making space: The development of spatial representation.',
    scaleUsed: 'WPPSI-IV, Spatial Reasoning',
  },
  discovery_world: {
    code: 'discovery_world',
    clinicalName: 'Scientific Inquiry',
    academicName: 'Exploratory Behavior',
    parentFriendlyName: 'Dünya Keşfi',
    description: 'Curiosity, exploration, and understanding of the physical and natural world.',
    evidenceSource: 'Gopnik, A., et al. (1999). How babies think: The science of childhood.',
    scaleUsed: 'Science Inquiry Assessment',
  },
  self_help: {
    code: 'self_help',
    clinicalName: 'Adaptive Behavior',
    academicName: 'Self-Care Skills',
    parentFriendlyName: 'Öz-Bakım ve Bağımsızlık',
    description: 'Daily living skills including feeding, dressing, toileting, and personal hygiene.',
    evidenceSource: 'Sparrow, S. S., et al. (2005). Vineland Adaptive Behavior Scales.',
    scaleUsed: 'Vineland-3, ABAS-3',
  },
}

/**
 * Get clinical term for a domain
 */
export function getClinicalTerm(domainCode: string): ClinicalTerm | null {
  return CLINICAL_TERMINOLOGY[domainCode] || null
}

/**
 * Get all clinical terms
 */
export function getAllClinicalTerms(): ClinicalTerm[] {
  return Object.values(CLINICAL_TERMINOLOGY)
}

/**
 * Format domain name for different audiences
 */
export function formatDomainName(
  domainCode: string,
  audience: 'clinical' | 'academic' | 'parent'
): string {
  const term = getClinicalTerm(domainCode)
  if (!term) return domainCode

  switch (audience) {
    case 'clinical':
      return term.clinicalName
    case 'academic':
      return term.academicName
    case 'parent':
      return term.parentFriendlyName
    default:
      return term.parentFriendlyName
  }
}

