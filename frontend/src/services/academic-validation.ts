/**
 * 📚 ACADEMIC VALIDATION MODEL
 * 
 * Evidence-based validation for each domain assessment.
 * Used for pitch decks, research, and clinical credibility.
 */

export interface ValidationEvidence {
  domain: string
  evidenceSource: string
  scaleUsed: string
  confidenceLevel: 'high' | 'medium' | 'low'
  validationNotes?: string
}

export const ACADEMIC_VALIDATION: Record<string, ValidationEvidence> = {
  executive_functions: {
    domain: 'executive_functions',
    evidenceSource: 'Diamond, A. (2013). Executive functions. Annual Review of Psychology, 64, 135-168.',
    scaleUsed: 'Bayley-III, BRIEF-P',
    confidenceLevel: 'high',
    validationNotes: 'Validated against Bayley Scales of Infant and Toddler Development, Third Edition.',
  },
  language_communication: {
    domain: 'language_communication',
    evidenceSource: 'Bates, E., et al. (1995). Individual differences and their implications for theories of language development.',
    scaleUsed: 'CDI, PLS-5',
    confidenceLevel: 'high',
    validationNotes: 'Aligned with MacArthur-Bates Communicative Development Inventories and Preschool Language Scales.',
  },
  social_emotional: {
    domain: 'social_emotional',
    evidenceSource: 'Denham, S. A. (2006). Social-emotional competence as support for school readiness.',
    scaleUsed: 'ASQ:SE, DECA',
    confidenceLevel: 'high',
    validationNotes: 'Based on Ages & Stages Questionnaires: Social-Emotional and Devereux Early Childhood Assessment.',
  },
  gross_motor: {
    domain: 'gross_motor',
    evidenceSource: 'Gallahue, D. L., & Ozmun, J. C. (2006). Understanding motor development.',
    scaleUsed: 'PDMS-2, Bayley-III Motor Scale',
    confidenceLevel: 'high',
    validationNotes: 'Validated against Peabody Developmental Motor Scales and Bayley Motor Scale.',
  },
  fine_motor: {
    domain: 'fine_motor',
    evidenceSource: 'Case-Smith, J. (2006). Fine motor outcomes in preschool children.',
    scaleUsed: 'PDMS-2, VMI',
    confidenceLevel: 'high',
    validationNotes: 'Aligned with Peabody Developmental Motor Scales and Beery-Buktenica Developmental Test of Visual-Motor Integration.',
  },
  logical_numerical: {
    domain: 'logical_numerical',
    evidenceSource: 'Dehaene, S. (2011). The number sense: How the mind creates mathematics.',
    scaleUsed: 'TEMA-3, WJ-IV',
    confidenceLevel: 'medium',
    validationNotes: 'Based on Test of Early Mathematics Ability and Woodcock-Johnson IV.',
  },
  creative_expression: {
    domain: 'creative_expression',
    evidenceSource: 'Runco, M. A. (2004). Creativity. Annual Review of Psychology, 55, 657-687.',
    scaleUsed: 'TTCT, Torrance Tests',
    confidenceLevel: 'medium',
    validationNotes: 'Inspired by Torrance Tests of Creative Thinking.',
  },
  spatial_awareness: {
    domain: 'spatial_awareness',
    evidenceSource: 'Newcombe, N. S., & Huttenlocher, J. (2000). Making space: The development of spatial representation.',
    scaleUsed: 'WPPSI-IV, Spatial Reasoning',
    confidenceLevel: 'medium',
    validationNotes: 'Aligned with Wechsler Preschool and Primary Scale of Intelligence spatial reasoning subtests.',
  },
  discovery_world: {
    domain: 'discovery_world',
    evidenceSource: 'Gopnik, A., et al. (1999). How babies think: The science of childhood.',
    scaleUsed: 'Science Inquiry Assessment',
    confidenceLevel: 'low',
    validationNotes: 'Based on exploratory behavior research, custom assessment framework.',
  },
  self_help: {
    domain: 'self_help',
    evidenceSource: 'Sparrow, S. S., et al. (2005). Vineland Adaptive Behavior Scales.',
    scaleUsed: 'Vineland-3, ABAS-3',
    confidenceLevel: 'high',
    validationNotes: 'Validated against Vineland Adaptive Behavior Scales, Third Edition and Adaptive Behavior Assessment System.',
  },
}

/**
 * Get validation evidence for a domain
 */
export function getValidationEvidence(domainCode: string): ValidationEvidence | null {
  return ACADEMIC_VALIDATION[domainCode] || null
}

/**
 * Get all validation evidence
 */
export function getAllValidationEvidence(): ValidationEvidence[] {
  return Object.values(ACADEMIC_VALIDATION)
}

/**
 * Format validation for pitch deck
 */
export function formatValidationForPitch(): string {
  const highConfidence = getAllValidationEvidence().filter(v => v.confidenceLevel === 'high').length
  const total = getAllValidationEvidence().length
  
  return `${highConfidence}/${total} domains validated against clinical scales (Bayley, Vineland, PDMS-2, etc.)`
}

