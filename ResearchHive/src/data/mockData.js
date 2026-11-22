export const fakeNewsDemoPapers = [
  {
    id: 'fn-1',
    name: 'Fake_News_Detection_Linguistics.pdf',
    title: 'Linguistic Analysis for Fake News Detection',
    authors: ['Perez-Rosas et al.'],
    year: 2018,
    pages: 12,
    size: '1.2 MB',
    status: 'completed',
    abstract: 'This paper explores the role of linguistic features in identifying fake news across multiple domains.',
    methodology: 'Support Vector Machines (SVM) with n-gram and readability features',
    keyFindings: ['Linguistic patterns differ significantly between fake and real news', 'Cross-domain detection is challenging but possible'],
    limitations: ['Limited to text features only', 'Sensitive to domain shifts'],
    citations: 450,
    venue: 'COLING 2018'
  },
  {
    id: 'fn-2',
    name: 'Deep_Learning_Propagation.pdf',
    title: 'Propagation-based Fake News Detection with Graph Neural Networks',
    authors: ['Monti et al.'],
    year: 2019,
    pages: 14,
    size: '2.5 MB',
    status: 'completed',
    abstract: 'We propose a geometric deep learning approach to detect fake news by analyzing its propagation patterns on social networks.',
    methodology: 'Graph Convolutional Networks (GCN) on social graphs',
    keyFindings: ['Structural propagation patterns are highly indicative of news veracity', 'Social context improves detection over text-only models'],
    limitations: ['Requires access to social graph data', 'Computationally expensive for large networks'],
    citations: 820,
    venue: 'KDD 2019'
  },
  {
    id: 'fn-3',
    name: 'Multimodal_Fake_News.pdf',
    title: 'Multimodal Fake News Detection: Joining Text and Image Analysis',
    authors: ['Khattar et al.'],
    year: 2019,
    pages: 10,
    size: '3.2 MB',
    status: 'completed',
    abstract: 'An end-to-end framework that learns joint representations of text and images for fake news detection.',
    methodology: 'Variational Autoencoder (VAE) for multimodal fusion',
    keyFindings: ['Manipulated images often accompany fake news text', 'Multimodal fusion outperforms unimodal approaches by 12%'],
    limitations: ['Requires both text and images', 'Struggles with out-of-context but authentic images'],
    citations: 610,
    venue: 'WWW 2019'
  }
];

export const fakeNewsDemoResults = {
  overview: {
    title: 'Research Synthesis: Fake News Detection Using Machine Learning',
    researchQuestion: 'How do linguistic, structural, and multimodal features contribute to fake news detection?',
    summary: `This synthesis examines three distinct paradigms in fake news detection: linguistic analysis, propagation patterns, and multimodal fusion.

Key Conclusions:
1. **Linguistic Cues**: Fake news often exhibits higher emotionality and lower readability scores.
2. **Social Context**: How news spreads is often more indicative than the content itself.
3. **Multimodal Synergy**: Combining text with image analysis provides the most robust detection framework in modern social media environments.

The consensus across these works is that hybrid models combining multiple feature sets offer the highest resilience against evolving misinformation strategies.`,
    keyStatistics: {
      totalPapers: 3,
      totalCitations: 1880,
      yearRange: '2018-2019',
      venues: 3,
      keyConcepts: 112,
      methodologies: 3
    },
    consensusScore: 84,
    themes: [
      { name: 'Feature Engineering', papers: ['fn-1'], description: 'Traditional NLP features and linguistic style' },
      { name: 'Graph Methods', papers: ['fn-2'], description: 'Social network structure and propagation' },
      { name: 'Deep Learning', papers: ['fn-3'], description: 'Multimodal fusion and automatic feature learning' }
    ]
  },
  paperInsights: [
    {
      paperId: 'fn-1',
      insights: [
        { type: 'innovation', text: 'Creation of a cross-domain dataset for linguistic fake news analysis', impact: 'medium' },
        { type: 'finding', text: 'Fake news tends to use more first-person pronouns and superlative adjectives', impact: 'high' }
      ]
    },
    {
      paperId: 'fn-2',
      insights: [
        { type: 'innovation', text: 'First application of GCNs to social media news propagation', impact: 'high' },
        { type: 'finding', text: 'Fake news propagation graphs are often deeper and more sparse', impact: 'high' }
      ]
    },
    {
      paperId: 'fn-3',
      insights: [
        { type: 'innovation', text: 'SpotFake framework for cross-modal consistency checking', impact: 'medium' },
        { type: 'finding', text: 'Text-image inconsistency is a strong signal for automated misinformation', impact: 'high' }
      ]
    }
  ],
  comparison: {
    dimensions: [
      { name: 'Primary Feature', papers: { 'fn-1': 'Linguistic/Text', 'fn-2': 'Social/Graph', 'fn-3': 'Text+Image' } },
      { name: 'Model Type', papers: { 'fn-1': 'SVM/Random Forest', 'fn-2': 'GCN', 'fn-3': 'VAE/CNN' } },
      { name: 'Data Source', papers: { 'fn-1': 'PolitiFact/BuzzFeed', 'fn-2': 'Twitter/Weibo', 'fn-3': 'PHEME/GossipCop' } }
    ],
    radarData: [
      { subject: 'Linguistic Analysis', Novelty: 60, Methodology: 75, Datasets: 80, Evaluation: 85, Impact: 70 },
      { subject: 'Graph Propagation', Novelty: 95, Methodology: 90, Datasets: 70, Evaluation: 80, Impact: 85 },
      { subject: 'Multimodal Fusion', Novelty: 85, Methodology: 85, Datasets: 90, Evaluation: 75, Impact: 90 }
    ]
  },
  researchGaps: [
    {
      id: 'fn-gap-1',
      title: 'Real-time Detection at Scale',
      description: 'Current models (especially graph-based) are computationally heavy. Detecting fake news in the first minutes of propagation remains a major challenge.',
      severity: 'high',
      relatedPapers: ['fn-2'],
      potentialDirections: ['Streaming graph algorithms', 'Edge-computing for detection']
    },
    {
      id: 'fn-gap-2',
      title: 'Explainability in Detection',
      description: 'While deep learning models achieve high accuracy, they lack transparency. Users need to know *why* a piece of news was flagged.',
      severity: 'medium',
      relatedPapers: ['fn-3'],
      potentialDirections: ['Attention map visualization', 'Rule-extraction from VAEs']
    }
  ],
  references: [
    { id: 'fn-ref-1', title: 'Linguistic Analysis for Fake News Detection', authors: 'Perez-Rosas, V., Kleinberg, B., Lefevre, A., Mihalcea, R.', venue: 'COLING', year: 2018, citations: 450, url: '#' },
    { id: 'fn-ref-2', title: 'Propagation-based Fake News Detection with Graph Neural Networks', authors: 'Monti, F., Frasca, F., Eynard, D., et al.', venue: 'KDD', year: 2019, citations: 820, url: '#' },
    { id: 'fn-ref-3', title: 'Multimodal Fake News Detection', authors: 'Khattar, D., Goud, J.S., Gupta, M., Varma, V.', venue: 'WWW', year: 2019, citations: 610, url: '#' }
  ]
};

export const mockPapers = [
  {
    id: 'paper-1',
    name: 'Attention Is All You Need.pdf',
    title: 'Attention Is All You Need',
    authors: ['Vaswani et al.'],
    year: 2017,
    pages: 15,
    size: '2.4 MB',
    status: 'completed',
    abstract: 'We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.',
    methodology: 'Encoder-decoder architecture with multi-head self-attention',
    keyFindings: [
      'Self-attention allows parallelization',
      'Multi-head attention captures different representation subspaces',
      'Positional encodings enable sequence order awareness'
    ],
    limitations: [
      'Quadratic complexity with sequence length',
      'Requires large amounts of training data'
    ],
    citations: 120000,
    venue: 'NeurIPS 2017'
  },
  {
    id: 'paper-2',
    name: 'BERT_Pre-training_of_Deep_Bidirectional_Transformers.pdf',
    title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
    authors: ['Devlin et al.'],
    year: 2019,
    pages: 16,
    size: '3.1 MB',
    status: 'completed',
    abstract: 'We introduce BERT, a method for pre-training deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context.',
    methodology: 'Masked Language Model (MLM) and Next Sentence Prediction (NSP) pre-training',
    keyFindings: [
      'Bidirectional pre-training significantly improves downstream tasks',
      'MLM enables learning deep bidirectional representations',
      'Pre-training + fine-tuning paradigm sets new SOTA on 11 NLP tasks'
    ],
    limitations: [
      'NSP task may not be necessary',
      'Large computational cost for pre-training',
      'Fixed input length limitation (512 tokens)'
    ],
    citations: 85000,
    venue: 'NAACL 2019'
  },
  {
    id: 'paper-3',
    name: 'RoBERTa_A_Robustly_Optimized_BERT_Pretraining_Approach.pdf',
    title: 'RoBERTa: A Robustly Optimized BERT Pretraining Approach',
    authors: ['Liu et al.'],
    year: 2019,
    pages: 18,
    size: '2.8 MB',
    status: 'completed',
    abstract: 'We present a replication study of BERT pretraining that measures the impact of key hyperparameters and training data size.',
    methodology: 'Dynamic masking, removal of NSP, larger batches, more data, longer training',
    keyFindings: [
      'Removing NSP matches or improves performance',
      'Dynamic masking outperforms static masking',
      'Large batch training with learning rate scaling works well',
      'More data and longer training consistently improves results'
    ],
    limitations: [
      'Still limited by 512 token context',
      'Massive compute requirements (160GB text, 1024 GPUs)'
    ],
    citations: 45000,
    venue: 'ICML 2020'
  },
  {
    id: 'paper-4',
    name: 'Longformer_The_Long_Document_Transformer.pdf',
    title: 'Longformer: The Long-Document Transformer',
    authors: ['Beltagy et al.'],
    year: 2020,
    pages: 17,
    size: '4.2 MB',
    status: 'completed',
    abstract: 'We present Longformer, a transformer model with a sparse attention mechanism that scales linearly with sequence length.',
    methodology: 'Sparse attention combining local windowed attention with global attention',
    keyFindings: [
      'Linear complexity enables processing documents of thousands of tokens',
      'Global attention tokens allow task-specific information aggregation',
      'Matches or exceeds BERT/RoBERTa on long document tasks'
    ],
    limitations: [
      'Requires task-specific global attention configuration',
      'Slower than standard attention for short sequences',
      'Complex implementation'
    ],
    citations: 12000,
    venue: 'ICLR 2020'
  },
  {
    id: 'paper-5',
    name: 'BigBird_Transformers_for_Longer_Sequences.pdf',
    title: 'Big Bird: Transformers for Longer Sequences',
    authors: ['Zaheer et al.'],
    year: 2021,
    pages: 18,
    size: '3.7 MB',
    status: 'completed',
    abstract: 'We propose BigBird, a sparse attention mechanism that reduces the quadratic dependency of full attention to linear.',
    methodology: 'Combination of random, window, and global attention',
    keyFindings: [
      'Theoretical guarantees for universal approximation and Turing completeness',
      'Effective on long sequences (4096 tokens) with linear complexity',
      'Global tokens provide flexibility for different tasks'
    ],
    limitations: [
      'Random attention introduces variance',
      'Requires careful tuning of attention patterns',
      'Performance depends on task-specific global token placement'
    ],
    citations: 8500,
    venue: 'ICML 2021'
  }
];

export const mockAgents = [
  {
    id: 'agent-1',
    name: 'Paper Analyst',
    role: 'Extracts key concepts, methodology, and findings from each paper',
    icon: 'Search',
    color: 'electric-blue',
    status: 'completed',
    progress: 100,
    description: 'Analyzes paper structure, extracts abstract, methodology, results, and limitations',
    estimatedTime: '2-3 min per paper'
  },
  {
    id: 'agent-2',
    name: 'Methodology Analyst',
    role: 'Compares and contrasts research methodologies across papers',
    icon: 'GitCompare',
    color: 'violet',
    status: 'completed',
    progress: 100,
    description: 'Identifies methodological similarities, differences, and evolution across papers',
    estimatedTime: '3-4 min'
  },
  {
    id: 'agent-3',
    name: 'Critique Agent',
    role: 'Identifies strengths, weaknesses, and potential biases in each work',
    icon: 'AlertTriangle',
    color: 'cyan',
    status: 'completed',
    progress: 100,
    description: 'Provides critical analysis of experimental design, claims, and reproducibility',
    estimatedTime: '2-3 min'
  },
  {
    id: 'agent-4',
    name: 'Citation Agent',
    role: 'Maps citation networks and identifies influential works',
    icon: 'Link2',
    color: 'electric-blue',
    status: 'completed',
    progress: 100,
    description: 'Builds citation graphs, finds seminal papers and emerging trends',
    estimatedTime: '1-2 min'
  },
  {
    id: 'agent-5',
    name: 'Research Manager',
    role: 'Synthesizes findings into coherent literature review narrative',
    icon: 'Brain',
    color: 'violet',
    status: 'completed',
    progress: 100,
    description: 'Generates structured review with themes, gaps, and future directions',
    estimatedTime: '3-5 min'
  }
];

export const mockTimeline = [
  { agentId: 'agent-1', stage: 'Paper Analyst', status: 'completed', startTime: '0:00', endTime: '8:42', details: 'Processed 5 papers, extracted 247 key concepts' },
  { agentId: 'agent-2', stage: 'Methodology Analyst', status: 'completed', startTime: '8:42', endTime: '12:15', details: 'Identified 3 methodological paradigms across papers' },
  { agentId: 'agent-3', stage: 'Critique Agent', status: 'completed', startTime: '12:15', endTime: '15:33', details: 'Found 12 limitations and 8 strengths across papers' },
  { agentId: 'agent-4', stage: 'Citation Agent', status: 'completed', startTime: '15:33', endTime: '16:45', details: 'Mapped 2,847 citations, identified 3 seminal works' },
  { agentId: 'agent-5', stage: 'Research Manager', status: 'completed', startTime: '16:45', endTime: '21:12', details: 'Generated review with 5 thematic sections' }
];

export const mockResults = {
  overview: {
    title: 'Literature Review: Transformer Architecture Evolution (2017-2021)',
    researchQuestion: 'How have transformer architectures evolved to handle longer sequences and improve efficiency?',
    summary: `This review examines five seminal papers tracing the evolution of transformer architectures from the original "Attention Is All You Need" (2017) through specialized long-sequence models (2020-2021). The field has progressed from establishing the core attention mechanism to addressing fundamental scalability limitations.

Key themes identified:
1. **Attention Mechanism Evolution**: From dense self-attention to sparse/linear variants
2. **Pre-training Paradigms**: MLM, NSP, and their optimizations
3. **Scalability Solutions**: Windowed, global, and random attention patterns
4. **Empirical Scaling Laws**: More data, larger batches, longer training consistently improve results

The progression reveals a clear trajectory: each subsequent work addresses specific limitations of its predecessors while maintaining the core transformer principles.`,
    keyStatistics: {
      totalPapers: 5,
      totalCitations: 270500,
      yearRange: '2017-2021',
      venues: 4,
      keyConcepts: 247,
      methodologies: 3
    },
    themes: [
      { name: 'Sparse Attention Mechanisms', papers: ['paper-4', 'paper-5'], description: 'Linear complexity alternatives to quadratic attention' },
      { name: 'Pre-training Optimization', papers: ['paper-2', 'paper-3'], description: 'BERT variants with improved training strategies' },
      { name: 'Architectural Foundations', papers: ['paper-1'], description: 'Original transformer architecture establishing core principles' }
    ]
  },
  paperInsights: [
    {
      paperId: 'paper-1',
      insights: [
        { type: 'innovation', text: 'Introduced pure attention-based architecture eliminating recurrence', impact: 'high' },
        { type: 'finding', text: 'Multi-head attention enables model to attend to different representation subspaces', impact: 'high' },
        { type: 'limitation', text: 'Quadratic complexity O(n²) limits sequence length to ~512-1024 tokens', impact: 'high' }
      ]
    },
    {
      paperId: 'paper-2',
      insights: [
        { type: 'innovation', text: 'Bidirectional pre-training via MLM revolutionized NLP transfer learning', impact: 'high' },
        { type: 'finding', text: 'Pre-training + fine-tuning paradigm achieves SOTA on 11 benchmarks', impact: 'high' },
        { type: 'limitation', text: 'NSP task later shown to be unnecessary; fixed 512 token limit remains', impact: 'medium' }
      ]
    },
    {
      paperId: 'paper-3',
      insights: [
        { type: 'finding', text: 'Dynamic masking outperforms static masking significantly', impact: 'medium' },
        { type: 'finding', text: 'Removing NSP matches or improves downstream performance', impact: 'high' },
        { type: 'finding', text: 'Large batch training (8K) with learning rate scaling is effective', impact: 'medium' },
        { type: 'limitation', text: 'Massive compute requirements (160GB data, 1024 GPUs) limit reproducibility', impact: 'high' }
      ]
    },
    {
      paperId: 'paper-4',
      insights: [
        { type: 'innovation', text: 'Sparse attention combining local windowed + global attention', impact: 'high' },
        { type: 'finding', text: 'Linear complexity O(n) enables 4096+ token sequences', impact: 'high' },
        { type: 'limitation', text: 'Task-specific global attention configuration required', impact: 'medium' }
      ]
    },
    {
      paperId: 'paper-5',
      insights: [
        { type: 'innovation', text: 'Theoretical guarantees for universal approximation with sparse attention', impact: 'high' },
        { type: 'finding', text: 'Random + window + global attention combination is effective', impact: 'medium' },
        { type: 'limitation', text: 'Random attention introduces variance; needs careful tuning', impact: 'medium' }
      ]
    }
  ],
  comparison: {
    dimensions: [
      { name: 'Attention Type', papers: { 'paper-1': 'Dense (Full)', 'paper-2': 'Dense (Full)', 'paper-3': 'Dense (Full)', 'paper-4': 'Sparse (Local+Global)', 'paper-5': 'Sparse (Random+Window+Global)' } },
      { name: 'Complexity', papers: { 'paper-1': 'O(n²)', 'paper-2': 'O(n²)', 'paper-3': 'O(n²)', 'paper-4': 'O(n)', 'paper-5': 'O(n)' } },
      { name: 'Max Sequence Length', papers: { 'paper-1': '512', 'paper-2': '512', 'paper-3': '512', 'paper-4': '4096', 'paper-5': '4096' } },
      { name: 'Pre-training Objective', papers: { 'paper-1': 'N/A (Supervised)', 'paper-2': 'MLM + NSP', 'paper-3': 'MLM (Dynamic)', 'paper-4': 'MLM', 'paper-5': 'MLM' } },
      { name: 'Training Data', papers: { 'paper-1': 'WMT En-De/Fr', 'paper-2': 'BooksCorpus + Wikipedia', 'paper-3': '160GB (CC-News, Stories, Wikipedia)', 'paper-4': 'Similar to RoBERTa', 'paper-5': 'Similar to RoBERTa' } },
      { name: 'Key Innovation', papers: { 'paper-1': 'Self-Attention Architecture', 'paper-2': 'Bidirectional Pre-training', 'paper-3': 'Training Optimization', 'paper-4': 'Sparse Attention Pattern', 'paper-5': 'Theoretical Guarantees' } }
    ],
    radarData: [
      { subject: 'Attention Is All You Need', Innovation: 95, Impact: 100, Scalability: 30, Efficiency: 40, Reproducibility: 80 },
      { subject: 'BERT', Innovation: 90, Impact: 95, Scalability: 35, Efficiency: 45, Reproducibility: 70 },
      { subject: 'RoBERTa', Innovation: 70, Impact: 90, Scalability: 40, Efficiency: 60, Reproducibility: 50 },
      { subject: 'Longformer', Innovation: 85, Impact: 80, Scalability: 90, Efficiency: 75, Reproducibility: 75 },
      { subject: 'BigBird', Innovation: 80, Impact: 75, Scalability: 95, Efficiency: 70, Reproducibility: 70 }
    ]
  },
  researchGaps: [
    {
      id: 'gap-1',
      title: 'Unified Sparse Attention Framework',
      description: 'No consensus on optimal sparse attention pattern. Longformer uses fixed local+global, BigBird uses random+window+global. A unified theory guiding pattern selection for specific tasks is missing.',
      severity: 'high',
      relatedPapers: ['paper-4', 'paper-5'],
      potentialDirections: [
        'Adaptive attention patterns based on input content',
        'Learned sparse attention masks',
        'Hardware-aware attention pattern optimization'
      ]
    },
    {
      id: 'gap-2',
      title: 'Efficient Long-Context Pre-training',
      description: 'While sparse attention enables longer sequences at inference, pre-training on long contexts remains computationally expensive. Most long-context models are initialized from short-context checkpoints.',
      severity: 'high',
      relatedPapers: ['paper-4', 'paper-5'],
      potentialDirections: [
        'Progressive sequence length training curricula',
        'Efficient long-context pre-training objectives',
        'Distillation from short to long context models'
      ]
    },
    {
      id: 'gap-3',
      title: 'Positional Encoding for Variable Lengths',
      description: 'Current positional encodings (sinusoidal, learned, RoPE) are designed for fixed maximum lengths. Extrapolation to longer sequences at inference remains challenging.',
      severity: 'medium',
      relatedPapers: ['paper-1', 'paper-4', 'paper-5'],
      potentialDirections: [
        'Length-extrapolatable positional encodings',
        'Relative position biases with better generalization',
        'Content-aware positional representations'
      ]
    },
    {
      id: 'gap-4',
      title: 'Multilingual and Cross-lingual Long Context',
      description: 'Long-context transformers are primarily evaluated on English. Cross-lingual transfer with sparse attention patterns is underexplored.',
      severity: 'medium',
      relatedPapers: ['paper-2', 'paper-3', 'paper-4'],
      potentialDirections: [
        'Multilingual long-context benchmarks',
        'Language-agnostic sparse attention patterns',
        'Cross-lingual transfer with long contexts'
      ]
    },
    {
      id: 'gap-5',
      title: 'Retrieval-Augmented vs. Pure Long Context',
      description: 'Trade-offs between retrieval-augmented generation and native long-context modeling are not well characterized. When to use which approach remains unclear.',
      severity: 'medium',
      relatedPapers: ['paper-4', 'paper-5'],
      potentialDirections: [
        'Hybrid retrieval + long-context architectures',
        'Task-specific guidelines for approach selection',
        'Efficiency-accuracy trade-off analysis'
      ]
    }
  ],
  references: [
    { id: 'ref-1', title: 'Attention Is All You Need', authors: 'Vaswani, A., Shazeer, N., Parmar, N., et al.', venue: 'NeurIPS', year: 2017, citations: 120000, url: 'https://arxiv.org/abs/1706.03762' },
    { id: 'ref-2', title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding', authors: 'Devlin, J., Chang, M.W., Lee, K., Toutanova, K.', venue: 'NAACL', year: 2019, citations: 85000, url: 'https://arxiv.org/abs/1810.04805' },
    { id: 'ref-3', title: 'RoBERTa: A Robustly Optimized BERT Pretraining Approach', authors: 'Liu, Y., Ott, M., Goyal, N., et al.', venue: 'ICML', year: 2019, citations: 45000, url: 'https://arxiv.org/abs/1907.11692' },
    { id: 'ref-4', title: 'Longformer: The Long-Document Transformer', authors: 'Beltagy, I., Peters, M.E., Cohan, A.', venue: 'ICLR', year: 2020, citations: 12000, url: 'https://arxiv.org/abs/2004.05150' },
    { id: 'ref-5', title: 'Big Bird: Transformers for Longer Sequences', authors: 'Zaheer, M., Guruganesh, G., Dubey, K.A., et al.', venue: 'ICML', year: 2021, citations: 8500, url: 'https://arxiv.org/abs/2007.14062' }
  ]
};

export const emptyStateMessages = {
  noPapers: {
    title: 'No papers uploaded yet',
    description: 'Drag and drop 3-5 PDF research papers to begin your literature review analysis',
    actionText: 'Upload Papers'
  },
  noResults: {
    title: 'No analysis results yet',
    description: 'Click "Start Analysis" to begin the multi-agent literature review process',
    actionText: 'Start Analysis'
  },
  error: {
    title: 'Something went wrong',
    description: 'We encountered an issue processing your request. Please try again or contact support.',
    actionText: 'Try Again'
  }
};