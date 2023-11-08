import React, { useContext, useEffect } from 'react'
import { useGPTServerAnalysis } from '@/hooks/useGPTServerAnalysis'
import { SparklesIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { Template } from '@pages/api/gpt-server/logos-ai'
import { CircularLoader } from '@components/buttons/JoinCommunityButton'
import { PrimaryButton } from '@components/buttons/PrimaryButton'

const analysisLabelsAndTypes = [
  { key: Template.Summarize_ToSimpleMarkdown, label: 'Summarize', setter: 'setSummarizeResponse' },
  { key: Template.SWOT_ToSimpleMarkdown, label: 'SWOT', setter: 'setSwotResponse' },
  { key: Template.CausalChain_ToSimpleMarkdown, label: 'Causal Chain', setter: 'setCausalChainResponse' },
  { key: Template.SecondOrder_ToSimpleMarkdown, label: 'Second Order', setter: 'setSecondOrderResponse' },
  {
    key: Template.UnbiasedCritique_ToSimpleMarkdown,
    label: 'Unbiased Critique',
    setter: 'setUnbiasedCritiqueResponse',
  },
  { key: Template.ProsAndCons_ToSimpleMarkdown, label: 'Pros and Cons', setter: 'setProsAndConsResponse' },
]

const initialState = {
  responses: {
    summarizeResponse: '',
    swotResponse: '',
    causalChainResponse: '',
    secondOrderResponse: '',
    unbiasedCritiqueResponse: '',
    prosAndConsResponse: '',
  },
  setResponses: {
    setSummarizeResponse: data => {},
    setSwotResponse: data => {},
    setCausalChainResponse: data => {},
    setSecondOrderResponse: data => {},
    setUnbiasedCritiqueResponse: data => {},
    setProsAndConsResponse: data => {},
  },
}

export const AIDigestContext = React.createContext(initialState)
export const useAIDigest = () => useContext(AIDigestContext)

const AIDigestButton = ({
  postData,
  enabled = {
    Summarize_ToSimpleMarkdown: true,
    SWOT_ToSimpleMarkdown: true,
    CausalChain_ToSimpleMarkdown: true,
    SecondOrder_ToSimpleMarkdown: true,
    UnbiasedCritique_ToSimpleMarkdown: true,
    ProsAndCons_ToSimpleMarkdown: true,
  },
}: {
  postData: string
  enabled?: {
    Summarize_ToSimpleMarkdown?: boolean
    SWOT_ToSimpleMarkdown?: boolean
    CausalChain_ToSimpleMarkdown?: boolean
    SecondOrder_ToSimpleMarkdown?: boolean
    UnbiasedCritique_ToSimpleMarkdown?: boolean
    ProsAndCons_ToSimpleMarkdown?: boolean
  }
}) => {
  const { setResponses } = useAIDigest()

  const analysesOptions = analysisLabelsAndTypes.map(type => ({
    postData,
    template: type.key,
  }))

  const analyses = useGPTServerAnalysis(analysesOptions)

  useEffect(() => {
    analysisLabelsAndTypes.forEach((type, index) => {
      if (analyses[index]?.data) setResponses[type.setter](analyses[index].data)
    })
  }, [analyses])

  const handleFetchData = () => {
    analyses
      .filter((analysis, index) => enabled[analysisLabelsAndTypes[index].key])
      .forEach(analysis => analysis.fetchData())
  }

  const anyLoading = analyses.some(analysis => analysis.isLoading)
  const anyResponses = analyses.some(analysis => analysis.data)

  useEffect(() => {
    // @ts-ignore
    window.onbeforeunload = anyLoading ? () => true : undefined
  }, [anyLoading])

  return (
      <PrimaryButton
        variant={'default'}
        className={ctaClass}
        onClick={handleFetchData}
        disabled={anyLoading || postData.length < 25 || anyResponses}
        isLoading={anyLoading}
      >
        AI Digest{' '}
        {!anyLoading ? (
          <SparklesIcon className={clsx('h-5 w-5', anyResponses ? 'text-white' : 'text-white')} height={20} />
        ) : (
          <CircularLoader />
        )}
      </PrimaryButton>
  )
}

const ctaClass = 'text-sm !bg-primary-400 !text-primary-foreground hover:!bg-primary-500 hover:!text-primary-foreground'

export default AIDigestButton
