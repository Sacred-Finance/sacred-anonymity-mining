import React, { useContext, useEffect } from 'react'
import { useGPTServerAnalysis } from '@/hooks/useGPTServerAnalysis'
import { SparklesIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { Template } from '@pages/api/gpt-server/logos-ai'
import { CircularLoader } from '@components/buttons/JoinCommunityButton'
import { PrimaryButton } from '@components/buttons/PrimaryButton'
import { AIDigestContext, useAIDigest } from '@components/Post/PostPage'

const analysisLabelsAndTypes = [
  { key: Template.Summarize_ToSimpleMarkdown, label: 'Summarize', setter: 'setSummarizeResponse', enabled: true },
  { key: Template.SWOT_ToSimpleMarkdown, label: 'SWOT', setter: 'setSwotResponse', enabled: true },
  {
    key: Template.CausalChain_ToSimpleMarkdown,
    label: 'Causal Chain',
    setter: 'setCausalChainResponse',
    enabled: true,
  },
  {
    key: Template.SecondOrder_ToSimpleMarkdown,
    label: 'Second Order',
    setter: 'setSecondOrderResponse',
    enabled: true,
  },
  {
    key: Template.UnbiasedCritique_ToSimpleMarkdown,
    label: 'Unbiased Critique',
    setter: 'setUnbiasedCritiqueResponse',
    enabled: true,
  },
  {
    key: Template.ProsAndCons_ToSimpleMarkdown,
    label: 'Pros and Cons',
    setter: 'setProsAndConsResponse',
    enabled: true,
  },
]
const AIDigestButton = ({ postData }: { postData: string }) => {
  const { enabled, responses, setResponses } = useAIDigest()

  const analysesOptions = analysisLabelsAndTypes
    .filter(analysis => enabled[analysis.key])
    .map(({ key }) => ({
      template: key,
      postData: postData,
    }))

  const analyses = useGPTServerAnalysis(analysesOptions)

  const handleFetchData = () => {
    analyses.forEach(analysis => {
      analysis.fetchData(data => {
        // Custom setter function that merges new data with existing responses
        setResponses(prevResponses => ({
          ...prevResponses,
          [analysis.template]: data,
        }))
      })
    })
  }

  const getButtonText = () => {
    const enabledAnalyses = analysisLabelsAndTypes.filter(({ key }) => enabled[key])
    const allResponses = enabledAnalyses.every(({ key }) => responses[key])
    if (allResponses) {
      return 'Digest Complete'
    } else if (enabledAnalyses.length === 1) {
      return enabledAnalyses[0].label
    } else if (enabledAnalyses.length > 1) {
      return `AI Digest (${enabledAnalyses.length})`
    } else {
      return 'Select Analyses'
    }
  }

  const anyLoading = analyses.some(analysis => analysis.isLoading)
  const allResponses = analyses.every(analysis => analysis?.data?.length)
  // also disabled if there are no enabled options that have not been responded to
  const disabled = analysesOptions
    .filter(({ template }) => enabled[template])
    .every(({ template }) => responses[template])

  useEffect(() => {
    // @ts-ignore
    window.onbeforeunload = anyLoading ? () => true : undefined
  }, [anyLoading])

  return (
    <PrimaryButton
      variant={'default'}
      className={ctaClass}
      onClick={handleFetchData}
      disabled={anyLoading || postData.length < 25 || allResponses || disabled}
      isLoading={anyLoading}
      endIcon={<SparklesIcon className={'h-5 w-5 text-white'} height={20} />}
    >
      {getButtonText()}
    </PrimaryButton>
  )
}

const ctaClass = 'text-sm !bg-primary-400 !text-primary-foreground hover:!bg-primary-500 hover:!text-primary-foreground'

export default AIDigestButton
