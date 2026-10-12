export const landingSections = [
  {
    id: 'pipeline',
    number: '02',
    eyebrow: 'AUTOMATED CONTINUOUS DELIVERY',
    title: 'From commit to production in under 60 seconds.',
    titleLines: ['From commit to production', 'in under 60 seconds.'],
    description:
      'A git push triggers the full release workflow: build, test, publish to a private registry, and update dev, QA, and production in sync.',
    flow: ['GIT PUSH', 'BUILD', 'TEST', 'PRIVATE REGISTRY', 'DEV', 'QA', 'PRODUCTION'],
    facts: [
      'Blue-green releases and canary checks help validate changes safely',
      'Health checks can trigger an automatic rollback when a release fails',
      'Every environment updates from the same versioned release',
    ],
  },
  {
    id: 'configure',
    number: '03',
    eyebrow: 'REGISTER. CONFIGURE. SHIP.',
    title: 'Set up your app once. Evolut handles the infrastructure.',
    titleLines: ['Set up your app once.', 'Evolut handles the infrastructure.'],
    description:
      'Register an app with its name, port, and target environments. No technical setup or configuration files are required to get started.',
    details: [
      { label: '01 REGISTER YOUR APP', text: 'Add an application in seconds. Choose its name, port, and the environments it needs.' },
      { label: '02 CONFIGURE ONCE', text: 'Set secrets, environment variables, custom domains, and scaling rules from one interface. Evolut applies the infrastructure configuration automatically.' },
      { label: '03 PUSH AND IT’S LIVE', text: 'Every code push builds, tests, and deploys across dev, QA, and production. Certificates, secrets, and scaling are managed automatically.' },
    ],
  },
  {
    id: 'releases',
    number: '04',
    eyebrow: 'DEVELOPMENT, QA & PRODUCTION',
    title: 'Keep every environment in sync from one configuration.',
    titleLines: ['Keep every environment in sync', 'from one configuration.'],
    description:
      'Promote releases through isolated dev, QA, and production environments. Each stage gets the same versioned application with its own routing and runtime configuration.',
    flow: ['BUILD', 'DEV', 'QA', 'PRODUCTION'],
    environments: [
      { name: 'Dev Environment', url: 'dev.yourapp.com', version: 'Latest commit', status: 'Synced' },
      { name: 'QA Staging', url: 'qa.yourapp.com', version: 'Release candidate', status: 'Ready' },
      { name: 'Production', url: 'yourapp.com', version: 'Live release', status: 'Healthy' },
    ],
    facts: [
      'Three isolated environments from a single app configuration',
      'Automated certificates and routing for public app URLs',
      'Canary checks and automatic rollback help reduce release risk',
    ],
  },
  {
    id: 'security',
    number: '05',
    eyebrow: 'SECURITY & QUALITY GATES',
    title: 'Keep secrets out of code. Catch vulnerabilities before release.',
    titleLines: ['Keep secrets out of code.', 'Catch vulnerabilities before release.'],
    description:
      'Credentials are injected at runtime from an encrypted vault. Static analysis, dependency audits, and container scans check changes on every build.',
    details: [
      { label: 'SECRETS NEVER TOUCH YOUR CODE', text: 'Runtime injection keeps credentials out of source code. Rotate a secret across 10 services with one action—without manual updates or exposed environment variables.' },
      { label: 'CONTINUOUS ANALYSIS ON EVERY PUSH', text: 'Every commit is checked for code smells, coverage gaps, and technical debt. Quality gates can block risky changes before they reach production.' },
      { label: 'VULNERABILITIES CAUGHT BEFORE THEY SHIP', text: 'Static analysis, dependency audits, and container image scans flag CVEs and misconfigurations before they reach any environment.' },
      { label: 'ONE PLATFORM, MANY CLIENTS', text: 'Each tenant gets isolated environments, independent pipelines, and separate access controls on a shared cluster.' },
    ],
    facts: [
      '0 secrets in source code',
      'Zero manual secret management across environments',
    ],
  },
  {
    id: 'operations',
    number: '06',
    eyebrow: 'OBSERVABILITY & ELASTIC SCALING',
    title: 'Built for teams that can’t afford downtime.',
    titleLines: ['Built for teams that can’t', 'afford downtime.'],
    description:
      'Dashboards, log aggregation, and alerts are provisioned for every workload. Apps scale up to meet demand and scale down when traffic is idle.',
    telemetry: [
      { metric: 'CPU Utilization', value: '18.4%', badge: 'Optimal', sub: 'Elastic auto-balancing', bar: '24%' },
      { metric: 'Memory Allocated', value: '342 MB', badge: 'Stable', sub: 'Across 4 active pods', bar: '42%' },
      { metric: 'Request Throughput', value: '14.2k /s', badge: 'Healthy', sub: 'p99 latency 12ms', bar: '78%' },
      { metric: 'Cluster Uptime', value: '99.99%', badge: 'SLA', sub: 'Automatic failover', bar: '99%' },
    ],
    details: [
      { label: 'OBSERVABILITY FOR EVERY APP', text: 'Dashboards, log aggregation, and alerts are provisioned automatically for every deployed workload.' },
      { label: 'TRAFFIC SPIKES HANDLED SILENTLY', text: 'Workloads scale up before users notice a slowdown, then scale down to help save cost when idle.' },
      { label: 'SHARED CLUSTER, ISOLATED TENANTS', text: 'Each client receives isolated environments, independent pipelines, and separate access controls.' },
    ],
  },
  {
    id: 'business-case',
    number: '07',
    eyebrow: 'BUSINESS CASE & ROI',
    title: 'Your team ships code. We run everything else.',
    titleLines: ['Your team ships code.', 'We run everything else.'],
    description:
      'Evolut replaces the operational layer apps need in production—pipelines, secrets, monitoring, and environments—so engineers can focus on product work.',
    comparisons: [
      ['Deploy pipeline', 'Write YAML, configure CI/CD, and debug build failures yourself.', 'Push to git. Live in under 60 seconds, every time.'],
      ['Secrets & security', 'Rotate secrets manually across services; manage exposure and compliance risk.', 'Vault-managed, automatically rotated, and injected at runtime.'],
      ['Observability', 'Build monitoring, logs, and alert pipelines from scratch.', 'Dashboards, log aggregation, and alerts provisioned per app.'],
      ['Dev / QA / Prod', 'Clone and maintain every environment separately for each app.', 'Three isolated environments from one configuration.'],
      ['Code & container scanning', 'Wire SAST tools separately and triage CVEs by hand.', 'Every commit scanned; quality gates run on each deploy.'],
      ['Networking & routing', 'Configure service mesh, ingress, TLS certificates, and DNS yourself.', 'Public URL on first deploy; certificates and routing handled automatically.'],
    ],
    costNote:
      '$140k+ per year: median DevOps engineer salary in the US. Evolut covers the same operational surface—automated, maintained, and updated.',
    closingTitle: 'Ship on Friday. Not Monday.',
    closingDescription:
      'Every week spent on infrastructure is a week not spent on product. The average engineering team loses 14 hours each week to infrastructure toil; teams on Evolut can spend that time building features.',
    secondaryCta: 'See it live',
    cta: 'Book a Free Demo Now',
    ctaNote: '30-minute session · No commitment · See your environment live',
  },
]

