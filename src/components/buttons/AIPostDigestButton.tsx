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

const analysesOptions = analysisLabelsAndTypes.map(({ key }) => ({
  template: key,
  postData: '',
}))

const AIDigestButton = ({ postData }: { postData: string }) => {
  const {  enabled } = useAIDigest()
  const analyses = useGPTServerAnalysis(analysesOptions)

  const handleFetchData = () => {
    const enabledAnalyses = analyses.filter((analysis, index) => analysisLabelsAndTypes[index].enabled)
    enabledAnalyses.forEach(analysis => analysis.fetchData())
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
