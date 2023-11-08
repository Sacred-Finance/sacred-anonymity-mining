import {Template} from "@pages/api/gpt-server/logos-ai";

export const aiAccordionConfig = [
    {key: Template.Summarize_ToSimpleMarkdown, label: 'Summarize', responseKey: 'setSummarizeResponse'},
    {key: Template.SWOT_ToSimpleMarkdown, label: 'SWOT', responseKey: 'setSwotResponse'},
    {key: Template.CausalChain_ToSimpleMarkdown, label: 'Causal Chain', responseKey: 'setCausalChainResponse'},
    {key: Template.SecondOrder_ToSimpleMarkdown, label: 'Second Order', responseKey: 'setSecondOrderResponse'},
    {
        key: Template.UnbiasedCritique_ToSimpleMarkdown,
        label: 'Unbiased Critique',
        responseKey: 'setUnbiasedCritiqueResponse',
    },
    {key: Template.ProsAndCons_ToSimpleMarkdown, label: 'Pros and Cons', responseKey: 'setProsAndConsResponse'},
]
