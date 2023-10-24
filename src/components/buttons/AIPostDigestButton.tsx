import React, { useContext, useEffect } from 'react'
import { useGPTServerAnalysis } from '@/hooks/useGPTServerAnalysis'
import { CheckBadgeIcon, SparklesIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import ToolTip from '@components/HOC/ToolTip'
import { Template } from '@pages/api/gpt-server/logos-ai'
import { CircularLoader } from '@components/buttons/JoinCommunityButton'
import { Button } from '@/shad/ui/button'

const analysisLabelsAndTypes = [
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
    swotResponse: '',
    causalChainResponse: '',
    secondOrderResponse: '',
    unbiasedCritiqueResponse: '',
    prosAndConsResponse: '',
  },
  setResponses: {
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
    SWOT_ToSimpleMarkdown: true,
    CausalChain_ToSimpleMarkdown: true,
    SecondOrder_ToSimpleMarkdown: true,
    UnbiasedCritique_ToSimpleMarkdown: true,
    ProsAndCons_ToSimpleMarkdown: true,
  },
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

  const AnalysisComponent = () => (
    <div className="flex flex-col">
      {analysisLabelsAndTypes.map(type =>
        enabled[type.key] ? (
          <div key={type.key} className="flex flex-row items-center">
            <div className="mr-2">
              <CheckBadgeIcon className="h-4 w-4" />
            </div>
            <div>{type.label}</div>
          </div>
        ) : null
      )}
    </div>
  )

  const handleFetchData = () => {
    analyses
      .filter((analysis, index) => enabled[analysisLabelsAndTypes[index].key])
      .forEach(analysis => analysis.fetchData())
  }

  const anyLoading = analyses.some(analysis => analysis.isLoading)
  const anyResponses = analyses.some(analysis => analysis.data)

  useEffect(() => {
    window.onbeforeunload = anyLoading ? () => true : undefined
  }, [anyLoading])

  return (
    <div className="relative w-full">
      <Button
        variant={'outline'}
        onClick={handleFetchData}
        disabled={anyLoading || postData.length < 25 || anyResponses}
        isLoading={anyLoading}
      >

        AI Digest{' '}
        {!anyLoading ? (
          <SparklesIcon className={clsx('h-5 w-5', anyResponses ? 'text-white' : 'text-blue-500')} height={20} />
        ) : (
          <CircularLoader />
        )}
      </Button>
    </div>
  )
}

export default AIDigestButton
