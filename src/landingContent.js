export const landingSections = [
  {
    id: 'pipeline',
    number: '01',
    eyebrow: 'KUBERNETES-NATIVE APPLICATION PLATFORM',
    title: 'Production-grade Kubernetes. Ship fast. Ship secure.',
    description:
      'Your team writes code. We handle everything from deployment pipelines to secrets, monitoring, and scaling — automatically, on every push.',
    flow: ['GIT PUSH', 'BUILD (12s)', 'SECURITY SCAN', 'REGISTRY', 'DEV', 'QA', 'PRODUCTION (LIVE)'],
    facts: [
      '< 60s from git push to live running environment',
      '99.99% guaranteed availability with automatic failover',
      '0 manual secret management across all environments',
    ],
    terminal: {
      command: 'git push origin main',
      steps: [
        { label: 'Evolut Build', text: 'Building container image from source... done (11.8s)', status: 'success' },
        { label: 'Evolut Security', text: 'Automated CVE & SAST dependency audit: 0 issues found', status: 'success' },
        { label: 'Evolut Deploy', text: 'Promoting to Production cluster via GitOps → https://app.evolut.cloud', status: 'live' },
      ],
    },
  },
  {
    id: 'configure',
    number: '02',
    eyebrow: 'UNIFIED CONTROL PLANE',
    title: 'Add your app in seconds. Configure once.',
    description:
      'Add your application to the platform in seconds. Give it a name, a port, and choose which environments to enable. No technical setup or YAML required.',
    details: [
      { label: '01 REGISTER', text: 'Define service name, port, health check endpoints, and targeted runtime clusters.' },
      { label: '02 SECRETS & VAULT', text: 'AES-256 encrypted vault with runtime injection and one-click credentials rotation.' },
      { label: '03 DOMAINS & ROUTING', text: 'Automated Let’s Encrypt TLS/SSL certificates, DNS routing, and custom domains.' },
      { label: '04 DYNAMIC SCALING', text: 'Set predictive resource triggers that scale workloads from 0 to 100+ replicas.' },
    ],
  },
  {
    id: 'releases',
    number: '03',
    eyebrow: 'ZERO-TOUCH CONTINUOUS DELIVERY',
    title: 'From commit to production in under 60 seconds.',
    description:
      'Your pipeline builds, tests, pushes to your private registry, and deploys — triggered by a git push. All environments update in sync with zero downtime.',
    flow: ['COMMIT', 'BUILD', 'TEST', 'REGISTRY', 'DEPLOY', 'LIVE'],
    environments: [
      { name: 'Dev Environment', url: 'dev.evolut.cloud', version: 'v2.4.1', status: 'Live & Synced', ping: '11ms' },
      { name: 'QA Staging', url: 'qa.evolut.cloud', version: 'v2.4.1', status: 'Tests Passing', ping: '14ms' },
      { name: 'Production', url: 'app.evolut.cloud', version: 'v2.4.1', status: 'Zero-Downtime Rollout', ping: '9ms' },
    ],
    facts: [
      'Three fully isolated environments from a single configuration',
      'Automated blue-green rollouts with instant canary testing',
      'Automatic rollback upon failed health checks',
    ],
  },
  {
    id: 'security',
    number: '04',
    eyebrow: 'ENTERPRISE SECURITY & QUALITY GATES',
    title: 'Secrets never touch your code. Vulnerabilities caught before they ship.',
    description:
      'Credentials are injected at runtime from an encrypted vault. Static analysis, dependency audits, and container image scanning run on every build.',
    details: [
      { label: 'SECRETS VAULT', text: 'Credentials are injected at runtime from an encrypted vault. Rotating a secret across 10 services takes one action. No manual updates, no exposed variables.' },
      { label: 'VULNERABILITY SCAN', text: 'Static analysis, dependency audits, and container image scanning run on every build. CVEs and misconfigurations are flagged before reaching any environment.' },
      { label: 'QUALITY GATES', text: 'Every commit is scanned for code smells, coverage gaps, and technical debt. Quality gates block risky code from reaching production automatically.' },
      { label: 'MULTI-TENANCY', text: 'Each tenant gets isolated environments, independent pipelines, and separate access controls — on a shared cluster.' },
    ],
  },
  {
    id: 'operations',
    number: '05',
    eyebrow: 'OBSERVABILITY & AUTO-SCALING',
    title: 'Every app ships with observability. Traffic spikes handled silently.',
    description:
      'Dashboards, log aggregation, and alerts are provisioned automatically for every workload you deploy. Workloads scale up before users notice a slowdown, and scale down to save cost when idle.',
    telemetry: [
      { metric: 'CPU Utilization', value: '18.4%', badge: 'Optimal', sub: 'Elastic auto-balancing' },
      { metric: 'Memory Allocated', value: '342 MB', badge: 'Stable', sub: 'Across 4 active pods' },
      { metric: 'Request Throughput', value: '14.2k /s', badge: 'Healthy', sub: 'p99 latency 12ms' },
      { metric: 'Cluster Uptime', value: '99.99%', badge: 'SLA Active', sub: 'Zero packet loss' },
    ],
    details: [
      { label: 'OBSERVABILITY', text: 'Full dashboards, log aggregation, and alerts provisioned per app automatically with Prometheus & Grafana.' },
      { label: 'TRAFFIC SPIKES', text: 'Workloads scale horizontally and vertically before users notice slowdowns, then shrink to conserve spend.' },
      { label: 'ISOLATION', text: 'Each tenant gets isolated environments, independent pipelines, and separate RBAC access controls on shared clusters.' },
    ],
  },
  {
    id: 'business-case',
    number: '06',
    eyebrow: 'BUSINESS CASE & ROI',
    title: 'Your team ships code. We run everything else.',
    description:
      'Evolut replaces the operational layer your apps need in production — pipelines, secrets, monitoring, and environments — so your engineers can focus on what they were hired to build.',
    stats: [
      { value: '< 60s', label: 'From git push to live running environment' },
      { value: '99.99%', label: 'Guaranteed availability with automatic failover' },
      { value: '0 Secrets', label: 'Zero manual secret management across all environments' },
      { value: '-45%', label: 'Average infrastructure spend vs self-managed' },
    ],
    comparisons: [
      ['Deploy pipeline', 'Write YAML, configure CI/CD, debug build failures on your own time', 'Push to git. Live in under 60 seconds, every time.'],
      ['Secrets & security', 'Rotate by hand across services. Hope credentials never leak to git.', 'Vault-managed, auto-rotated, zero-touch. Nothing exposed.'],
      ['Observability', 'Build monitoring from scratch — Prometheus, Grafana, alerting pipelines', 'Full dashboards and alerts, provisioned per app automatically.'],
      ['Dev / QA / Prod', 'Clone and maintain every environment separately, for every app', 'Three fully isolated environments from a single configuration.'],
      ['Code & container scanning', 'Wire SAST tools separately, triage CVEs manually, skip releases under pressure', 'Every commit scanned. Automatic quality gates on every deploy.'],
      ['Networking & routing', 'Configure service mesh, ingress controllers, TLS certificates, and DNS yourself', 'Public URL on first deploy. Certificates and routing automatic.'],
    ],
    costNote:
      'Every week your team spends on infrastructure is a week not spent on product. Evolut eliminates that cost permanently.',
    cta: 'Book a Free Demo Now',
    ctaNote: '30-minute session · No commitment · See your environment live',
  },
]

