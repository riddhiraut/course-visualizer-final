import { Course } from '../models/Course';
import { ComputingProgram } from '../models/ComputingProgram';
import {
  AnyDepartmentLevelRule,
  ExplicitCatalogRule,
  CompositeOrRule,
} from '../models/ElectiveRule';

// ============================================================
// GLOBAL COURSE REPOSITORY (ALL KNOWN UGA COMPUTING & ADJACENT COURSES)
// ============================================================

export const ALL_COURSES: Record<string, Course> = {
  // MATH & STAT FOUNDATIONS
  'MATH 1113': new Course('MATH 1113', 'Precalculus', 3, {
    description: 'Intensive study of polynomial, rational, exponential, and trigonometric functions.',
  }),
  'MATH 2250': new Course('MATH 2250', 'Calculus I for Science and Engineering', 4, {
    prereqs: [],
    description: 'Limits, derivatives, definite integrals, and fundamental theorem of calculus.',
  }),
  'MATH 2260': new Course('MATH 2260', 'Calculus II for Science and Engineering', 4, {
    prereqs: ['MATH 2250'],
    description: 'Techniques of integration, applications of definite integrals, infinite sequences and series.',
  }),
  'MATH 2270': new Course('MATH 2270', 'Calculus III for Multivariable Analysis', 4, {
    prereqs: ['MATH 2260'],
    description: 'Vectors, curves, partial derivatives, multiple integrals, Green and Stokes theorems.',
  }),
  'MATH 2400': new Course('MATH 2400', 'Differential Calculus with Theory', 4, {
    prereqs: ['MATH 1113'],
    description: 'Rigorous theoretical development of differential calculus.',
  }),
  'MATH 2410': new Course('MATH 2410', 'Integral Calculus with Theory', 4, {
    prereqs: ['MATH 2400'],
    description: 'Rigorous theoretical treatment of integration and series.',
  }),
  'MATH 2500': new Course('MATH 2500', 'Multivariable Calculus', 3, {
    prereqs: ['MATH 2260'],
    description: 'Three-dimensional geometry, partial differentiation, multiple integration.',
  }),
  'MATH 2700': new Course('MATH 2700', 'Elementary Differential Equations', 3, {
    prereqs: ['MATH 2260'],
    description: 'First and second order differential equations, linear systems, Laplace transforms.',
  }),
  'MATH 3000': new Course('MATH 3000', 'Introduction to Linear Algebra', 3, {
    prereqs: ['MATH 2250'],
    aliases: ['MATH 3300'],
    description: 'Vector spaces, linear transformations, matrices, determinants, eigenvalues.',
  }),
  'MATH 3100': new Course('MATH 3100', 'Sequences and Series', 3, {
    prereqs: ['MATH 2260'],
    description: 'Convergence of sequences and series, power series, uniform convergence.',
  }),
  'MATH 3200': new Course('MATH 3200', 'Introduction to Higher Mathematics', 3, {
    prereqs: ['MATH 2260'],
    description: 'Mathematical proofs, sets, relations, functions, cardinality, equivalence relations.',
  }),
  'MATH 3300': new Course('MATH 3300', 'Applied Linear Algebra', 3, {
    prereqs: ['MATH 2260'],
    aliases: ['MATH 3000'],
    description: 'Systems of equations, vector spaces, matrix factorizations, singular value decomposition.',
  }),
  'MATH 3500': new Course('MATH 3500', 'Multivariable Mathematics I', 4, {
    prereqs: ['MATH 2260'],
    description: 'Integrated linear algebra and multivariable calculus with theoretical proofs.',
  }),
  'MATH 3510': new Course('MATH 3510', 'Multivariable Mathematics II', 4, {
    prereqs: ['MATH 3500'],
    aliases: ['MATH 3510H'],
    description: 'Continuation of MATH 3500, vector analysis, differential forms.',
  }),
  'MATH 4000': new Course('MATH 4000', 'Modern Algebra I', 3, {
    prereqs: ['MATH 3200'],
    description: 'Groups, subgroups, homomorphisms, quotient groups, fundamental homomorphism theorems.',
  }),
  'MATH 4100': new Course('MATH 4100', 'Real Analysis I', 3, {
    prereqs: ['MATH 3100', 'MATH 3200'],
    description: 'Rigorous treatment of metric spaces, compactness, continuity, differentiation, and Riemann-Stieltjes integration.',
  }),
  'MATH 4150': new Course('MATH 4150', 'Introduction to Modern Numerical Analysis', 3, {
    prereqs: ['MATH 2270', 'MATH 3000'],
    description: 'Numerical methods for linear systems, nonlinear equations, interpolation, and numerical integration.',
  }),
  'MATH 4200': new Course('MATH 4200', 'Complex Variables', 3, {
    prereqs: ['MATH 2270'],
    description: 'Complex numbers, analytic functions, Cauchy integral theorem, Taylor and Laurent series, residues.',
  }),
  'MATH 4220': new Course('MATH 4220', 'Partial Differential Equations', 3, {
    prereqs: ['MATH 2700'],
    description: 'Fourier series, heat equation, wave equation, Laplace equation, boundary value problems.',
  }),
  'MATH 4250': new Course('MATH 4250', 'Differential Geometry', 3, {
    prereqs: ['MATH 2270', 'MATH 3000'],
    description: 'Curves and surfaces in 3D Euclidean space, curvature, fundamental forms, Gauss-Bonnet theorem.',
  }),
  'MATH 4400': new Course('MATH 4400', 'Number Theory', 3, {
    prereqs: ['MATH 3200'],
    description: 'Divisibility, prime numbers, congruences, quadratic reciprocity, Diophantine equations.',
  }),
  'MATH 4500': new Course('MATH 4500', 'Numerical Analysis I', 3, {
    prereqs: ['MATH 2270', 'MATH 3000'],
    description: 'Iterative solutions of equations, error analysis, approximation theory, eigenvalue algorithms.',
  }),
  'MATH 4600': new Course('MATH 4600', 'Probability', 3, {
    prereqs: ['MATH 2270'],
    description: 'Axioms of probability, combinatorics, discrete and continuous random variables, probability densities, expectation, limit theorems.',
  }),
  'MATH 4670': new Course('MATH 4670', 'Combinatorics', 3, {
    prereqs: ['MATH 3200'],
    description: 'Enumeration, generating functions, recurrence relations, inclusion-exclusion, Polya theory.',
  }),
  'MATH 4690': new Course('MATH 4690', 'Graph Theory', 3, {
    prereqs: ['CSCI 2610'],
    description: 'Trees, connectivity, traversability, planar graphs, colorings, and network algorithms.',
  }),
  'MATH 4700': new Course('MATH 4700', 'Combinatorial Mathematics', 3, {
    prereqs: ['CSCI 2610'],
    description: 'Permutations, combinations, graphs, trees, network flows, combinatorial algorithms.',
  }),
  'MATH 4720': new Course('MATH 4720', 'Introduction to Topology', 3, {
    prereqs: ['MATH 3200'],
    description: 'Topological spaces, basis, product topology, connectedness, compactness, separation axioms.',
  }),
  'MATH 4760': new Course('MATH 4760', 'Mathematics of Interest and Financial Derivatives', 3, {
    prereqs: ['MATH 2260'],
    description: 'Stochastic calculus, Black-Scholes formula, options pricing, yield curves, interest rate models.',
  }),
  'MATH 4780': new Course('MATH 4780', 'Mathematical Optimization', 3, {
    prereqs: ['MATH 2270', 'MATH 3000'],
    description: 'Linear programming, simplex method, duality, convex optimization, Karush-Kuhn-Tucker conditions.',
  }),
  'MATH 4790': new Course('MATH 4790', 'Operations Research', 3, {
    prereqs: ['MATH 3000'],
    description: 'Network flows, dynamic programming, integer programming, game theory, queuing systems.',
  }),
  'MATH 4850': new Course('MATH 4850', 'Mathematical Biology', 3, {
    prereqs: ['MATH 2700'],
    description: 'Dynamical models in ecology, epidemiology, population biology, and neurobiology.',
  }),
  'MATH 4010': new Course('MATH 4010', 'Modern Algebra II', 3, {
    prereqs: ['MATH 4000'],
    description: 'Ring theory, ideals, unique factorization domains, fields, Galois theory.',
  }),
  'MATH 4110': new Course('MATH 4110', 'Real Analysis II', 3, {
    prereqs: ['MATH 4100'],
    description: 'Multivariable calculus from an advanced standpoint, differential forms, Lebesgue integration.',
  }),
  'MATH 4510': new Course('MATH 4510', 'Numerical Analysis II', 3, {
    prereqs: ['MATH 4500'],
    description: 'Numerical methods for partial differential equations, finite element methods, boundary value problems.',
  }),
  'MATH 4620': new Course('MATH 4620', 'Applied Stochastic Processes', 3, {
    prereqs: ['MATH 4600'],
    description: 'Markov chains, Poisson processes, renewal theory, branching processes, stationary processes.',
  }),
  'STAT 2000': new Course('STAT 2000', 'Introductory Statistics', 4, {
    prereqs: [],
    description: 'Data collection, exploratory data analysis, probability, confidence intervals, hypothesis testing.',
  }),
  'STAT 4210': new Course('STAT 4210', 'Statistical Methods', 3, {
    prereqs: ['STAT 2000'],
    description: 'Statistical estimation, one-sample and two-sample inference, ANOVA, regression.',
  }),
  'STAT 4220': new Course('STAT 4220', 'Applied Experimental Designs', 3, {
    prereqs: ['STAT 4230'],
    description: 'Factorial designs, blocking, randomized complete block designs, response surface methodology.',
  }),
  'STAT 4230': new Course('STAT 4230', 'Applied Regression Analysis', 3, {
    prereqs: ['STAT 2000', 'MATH 2250'],
    description: 'Simple and multiple linear regression, residual analysis, model diagnostics, variable selection.',
  }),
  'STAT 4240': new Course('STAT 4240', 'Sampling and Survey Methods', 3, {
    prereqs: ['STAT 2000'],
    description: 'Simple random sampling, stratified sampling, cluster sampling, ratio estimation.',
  }),
  'STAT 4260': new Course('STAT 4260', 'Statistical Quality Assurance', 3, {
    prereqs: ['STAT 2000'],
    description: 'Statistical process control, Shewhart charts, acceptance sampling.',
  }),
  'STAT 4270': new Course('STAT 4270', 'Network Data Analysis and Graphical Models', 3, {
    prereqs: ['STAT 2000'],
    description: 'Probabilistic graphical models, Bayesian networks, community detection in complex networks.',
  }),
  'STAT 4280': new Course('STAT 4280', 'Applied Time Series Analysis', 3, {
    prereqs: ['STAT 4230'],
    description: 'Autoregressive integrated moving average (ARIMA) models, seasonal forecasting, spectral analysis.',
  }),
  'STAT 4290': new Course('STAT 4290', 'Nonparametric Methods', 3, {
    prereqs: ['STAT 4230'],
    description: 'Rank tests, sign test, Wilcoxon rank-sum, bootstrap, kernel density estimation.',
  }),
  'STAT 4365': new Course('STAT 4365', 'Modern Statistical Programming', 3, {
    prereqs: ['STAT 2000'],
    description: 'High-performance statistical computing in R, data wrangling, tidyverse, automated reproducible reporting.',
  }),
  'STAT 4440': new Course('STAT 4440', 'Design and Analysis of Complex Computer Models', 3, {
    prereqs: ['STAT 4230'],
    description: 'Computer experiments, Gaussian process surrogate modeling, sensitivity analysis.',
  }),
  'STAT 4510': new Course('STAT 4510', 'Mathematical Statistics I', 3, {
    prereqs: ['MATH 2270'],
    description: 'Probability distributions, transformations of random variables, expectation, moment generating functions.',
  }),
  'STAT 4520': new Course('STAT 4520', 'Mathematical Statistics II', 3, {
    prereqs: ['STAT 4510'],
    aliases: ['STAT 4530'],
    description: 'Point and interval estimation, maximum likelihood, Neyman-Pearson lemma, hypothesis testing.',
  }),
  'STAT 4530': new Course('STAT 4530', 'Statistical Inference for Data Scientists', 3, {
    prereqs: ['CSCI 3360', 'STAT 4510'],
    aliases: ['STAT 4520'],
    description: 'Point and interval estimation, likelihood methods, hypothesis testing, asymptotic theory for ML.',
  }),
  'STAT 4710': new Course('STAT 4710', 'Introduction to Probability Theory I', 3, {
    prereqs: ['MATH 2270'],
    description: 'Combinatorics, discrete and continuous random variables, Markov chains.',
  }),
  'STAT 4720': new Course('STAT 4720', 'Introduction to Probability Theory II', 3, {
    prereqs: ['STAT 4710'],
    description: 'Limit theorems, Poisson processes, continuous-time Markov chains, Brownian motion.',
  }),
  'STAT 4360': new Course('STAT 4360', 'Statistical Machine Learning', 3, {
    prereqs: ['STAT 4230'],
    description: 'Statistical foundations of machine learning, regularization, kernel methods, tree ensembles.',
  }),
  'STAT 4620': new Course('STAT 4620', 'Applied Categorical Data Analysis', 3, {
    prereqs: ['STAT 4230'],
    description: 'Contingency tables, generalized linear models, logistic regression, Poisson regression, loglinear models.',
  }),
  'STAT 5030': new Course('STAT 5030', 'Data Science Capstone Course', 3, {
    prereqs: ['STAT 4230'],
    description: 'Real-world collaborative client data science project with end-to-end model deployment.',
  }),

  // COMPUTER SCIENCE CORE COURSES
  'CSCI 1301': new Course('CSCI 1301', 'Intro to Computing and Programming', 4, {
    prereqs: [],
    description: 'Algorithms, object-oriented concepts, control structures, methods, arrays in Java.',
  }),
  'CSCI 1302': new Course('CSCI 1302', 'Software Development', 4, {
    prereqs: ['CSCI 1301'],
    description: 'Software engineering practices, inheritance, polymorphism, unit testing, lambdas, JavaFX UI.',
  }),
  'CSCI 1730': new Course('CSCI 1730', 'Systems Programming', 4, {
    prereqs: ['CSCI 1302'],
    description: 'Unix system calls, C/C++ memory management, pointers, multi-threading, socket IPC.',
  }),
  'CSCI 2150': new Course('CSCI 2150', 'Introduction to Computational Science', 4, {
    prereqs: [],
    description: 'Numerical methods, computational simulations, error propagation, Python scientific computing.',
  }),
  'CSCI 2610': new Course('CSCI 2610', 'Discrete Mathematics for Computer Science', 4, {
    prereqs: [],
    description: 'Logic, sets, relations, functions, induction, combinatorics, recurrence relations.',
  }),
  'CSCI 2670': new Course('CSCI 2670', 'Introduction to Theory of Computing', 4, {
    prereqs: ['CSCI 2610'],
    description: 'Finite automata, regular expressions, context-free grammars, Turing machines, decidability.',
  }),
  'CSCI 2720': new Course('CSCI 2720', 'Data Structures', 4, {
    prereqs: ['CSCI 2610', 'CSCI 1302'],
    aliases: ['CSCI 2725'],
    description: 'Abstract data types, lists, stacks, queues, trees, hash tables, heaps, asymptotic analysis in C++.',
  }),
  'CSCI 2725': new Course('CSCI 2725', 'Data Structures for Data Science', 4, {
    prereqs: ['CSCI 1302', 'CSCI 2610'],
    aliases: ['CSCI 2720'],
    description: 'Data structures tailored for data science workflows, graph storage, vector indexing, spatial trees (interchangeable with CSCI 2720).',
  }),
  'CSCI 3030': new Course('CSCI 3030', 'Computing, Ethics, and Society', 3, {
    prereqs: [],
    description: 'Philosophical ethics applied to computing, intellectual property, privacy, autonomous systems, algorithmic bias.',
  }),
  'CSCI 3360': new Course('CSCI 3360', 'Data Science & Applied Machine Learning I', 4, {
    prereqs: ['CSCI 1301', 'MATH 2250'],
    description: 'Supervised and unsupervised learning, feature engineering, cross-validation, scikit-learn, PyTorch.',
  }),
  'CSCI 4050': new Course('CSCI 4050', 'Software Engineering', 4, {
    prereqs: ['CSCI 2720'],
    aliases: ['CSCI 4050/6050'],
    description: 'Software lifecycle, agile methodologies, requirements elicitation, design patterns, CI/CD, team projects.',
  }),
  'CSCI 4150': new Course('CSCI 4150', 'Numerical Simulations in Science and Engineering', 4, {
    prereqs: ['CSCI 1302', 'MATH 2270'],
    description: 'Finite difference methods, differential equation solvers, parallel computing for physical simulations.',
  }),
  'CSCI 4170': new Course('CSCI 4170', 'Introduction to Computational Investing', 4, {
    prereqs: ['CSCI 1302', 'MATH 3300'],
    description: 'Algorithmic trading, portfolio optimization, CAPM, quantitative financial backtesting.',
  }),
  'CSCI 4210': new Course('CSCI 4210', 'Simulation and Modeling', 4, {
    prereqs: ['CSCI 1302', 'STAT 2000'],
    description: 'Discrete-event simulation, queuing theory, random variate generation, model verification.',
  }),
  'CSCI 4250': new Course('CSCI 4250', 'Cybersecurity Fundamentals', 4, {
    prereqs: ['CSCI 1730'],
    description: 'Threat modeling, symmetric/asymmetric cryptography, authentication protocols, secure coding.',
  }),
  'CSCI 4260': new Course('CSCI 4260', 'Data Security and Privacy', 4, {
    prereqs: ['CSCI 2725'],
    description: 'Differential privacy, k-anonymity, access control models, encryption at rest and in transit.',
  }),
  'CSCI 4300': new Course('CSCI 4300', 'Web Programming', 4, {
    prereqs: ['CSCI 1302'],
    description: 'Modern full-stack web architectures, REST APIs, client-side frameworks, security, responsive UI.',
  }),
  'CSCI 4360': new Course('CSCI 4360', 'Data Science II: Deep Learning & Big Data', 4, {
    prereqs: ['CSCI 3360'],
    description: 'Deep neural networks, convolutional architectures, transformers, distributed computing with Spark.',
  }),
  'CSCI 4370': new Course('CSCI 4370', 'Database Management', 4, {
    prereqs: ['CSCI 2720'],
    aliases: ['CSCI 4370/6370'],
    description: 'Relational model, SQL, query optimization, indexing (B+ trees), transactions, ACID properties, NoSQL.',
  }),
  'CSCI 4380': new Course('CSCI 4380', 'Data Mining', 4, {
    prereqs: ['CSCI 2720'],
    description: 'Association rule mining, clustering, classification, anomaly detection, stream mining algorithms.',
  }),
  'CSCI 4470': new Course('CSCI 4470', 'Algorithms', 4, {
    prereqs: ['CSCI 2670', 'CSCI 2720'],
    description: 'Divide and conquer, greedy algorithms, dynamic programming, network flow, NP-completeness.',
  }),
  'CSCI 4570': new Course('CSCI 4570', 'Compilers', 4, {
    prereqs: ['CSCI 2670', 'CSCI 2720'],
    description: 'Lexical analysis, LL/LR parsing, semantic analysis, intermediate representation, code optimization.',
  }),
  'CSCI 4720': new Course('CSCI 4720', 'Computer Architecture', 4, {
    prereqs: ['CSCI 2670', 'CSCI 1730'],
    description: 'Instruction set architecture, pipelining, branch prediction, memory hierarchy, caches, multiprocessors.',
  }),
  'CSCI 4730': new Course('CSCI 4730', 'Operating Systems', 4, {
    prereqs: ['CSCI 1730', 'CSCI 2720'],
    description: 'Process scheduling, synchronization, deadlocks, virtual memory paging, file system implementation.',
  }),
  'CSCI 4760': new Course('CSCI 4760', 'Computer Networks', 4, {
    prereqs: ['CSCI 2670', 'CSCI 2720'],
    description: 'TCP/IP stack, routing protocols, sliding window flow control, congestion control, network security.',
  }),
  'CSCI 4780': new Course('CSCI 4780', 'Distributed Computing Systems', 4, {
    prereqs: ['CSCI 1730', 'CSCI 2720'],
    description: 'Consensus algorithms (Raft, Paxos), vector clocks, distributed hash tables, RPC frameworks.',
  }),
  'CSCI 4800': new Course('CSCI 4800', 'Human-Computer Interaction', 4, {
    prereqs: ['CSCI 1302'],
    description: 'User-centered design, heuristic evaluation, usability testing, accessibility, interaction paradigms.',
  }),
  'CSCI 4830': new Course('CSCI 4830', 'Virtual Reality and 3D User Interfaces', 4, {
    prereqs: ['CSCI 1302'],
    description: 'Spatial computing, 3D graphics, tracking systems, immersive interactive systems.',
  }),
  'CSCI 4810': new Course('CSCI 4810', 'Computer Graphics', 4, {
    prereqs: ['CSCI 1730', 'MATH 3000'],
    description: '2D/3D transformations, shading models, ray tracing, OpenGL pipelines, GPU programming.',
  }),
  'CSCI 4850': new Course('CSCI 4850', 'Biomedical Image Analysis', 4, {
    prereqs: ['CSCI 1302'],
    description: 'Medical imaging modalities (MRI, CT), image segmentation, registration, computer vision.',
  }),
  'CSCI 4870': new Course('CSCI 4870', 'Artificial Intelligence', 4, {
    prereqs: ['CSCI 2720'],
    description: 'Search algorithms, heuristic evaluation, game playing, constraint satisfaction, probabilistic reasoning.',
  }),
  'CSCI 4890': new Course('CSCI 4890', 'Special Topics in Computer Science', 4, {
    prereqs: ['CSCI 2720'],
    description: 'Emerging advanced topics in computing, AI agents, cloud architectures, quantum computing.',
  }),
  'CSCI 4130': new Course('CSCI 4130', 'Mobile Software Development', 4, {
    prereqs: ['CSCI 1302'],
    description: 'Mobile app development for Android and iOS, native SDKs, state management, mobile backend services.',
  }),
  'CSCI 4140': new Course('CSCI 4140', 'Numerical Analysis', 4, {
    prereqs: ['CSCI 1302', 'MATH 2260'],
    description: 'Error propagation, linear and non-linear systems, polynomial interpolation, numerical differentiation.',
  }),
  'CSCI 4330': new Course('CSCI 4330', 'Artificial Intelligence', 4, {
    prereqs: ['CSCI 2720'],
    aliases: ['CSCI 4870'],
    description: 'Knowledge representation, heuristic search, logic programming, automated reasoning.',
  }),
  'CSCI 4350': new Course('CSCI 4350', 'Global Social and Professional Issues in Computing', 3, {
    prereqs: ['CSCI 1302'],
    description: 'Social impact of algorithms, digital intellectual property, international privacy laws, AI ethics.',
  }),
  'CSCI 4530': new Course('CSCI 4530', 'Physical Computing', 4, {
    prereqs: ['CSCI 1730'],
    description: 'Microcontroller programming, embedded sensors, actuators, serial communication, IoT hardware prototyping.',
  }),
  'CSCI 4550': new Course('CSCI 4550', 'Mobile Robotics', 4, {
    prereqs: ['CSCI 2720'],
    description: 'Robot localization, SLAM, kinematics, path planning, obstacle avoidance, ROS framework.',
  }),
  'CSCI 4610': new Course('CSCI 4610', 'Computer Graphics', 4, {
    prereqs: ['CSCI 1730', 'MATH 3000'],
    aliases: ['CSCI 4810'],
    description: 'Geometric transformations, rasterization, shaders, lighting models, texture mapping.',
  }),
  'CSCI 4630': new Course('CSCI 4630', 'Scientific Visualization', 4, {
    prereqs: ['CSCI 1730'],
    description: 'Scalar/vector field visualization, volume rendering, flow visualization, multi-dimensional visual analytics.',
  }),
  'CSCI 4740': new Course('CSCI 4740', 'Embedded Systems', 4, {
    prereqs: ['CSCI 1730'],
    description: 'Real-time operating systems, embedded firmware, peripheral interfaces, low-power optimization.',
  }),
  'CSCI 4750': new Course('CSCI 4750', 'Cloud Computing', 4, {
    prereqs: ['CSCI 1730', 'CSCI 2720'],
    description: 'Virtualization, containers (Docker, Kubernetes), serverless functions, cloud storage, microservices.',
  }),
  'CSCI 4790': new Course('CSCI 4790', 'Software Security', 4, {
    prereqs: ['CSCI 1730', 'CSCI 2720'],
    description: 'Memory safety exploits, buffer overflows, fuzz testing, static code analysis, binary reverse engineering.',
  }),
  'CSCI 4820': new Course('CSCI 4820', 'Video Game Programming', 4, {
    prereqs: ['CSCI 1302'],
    description: 'Game loop architectures, 2D/3D physics engines, collision detection, game AI, audio pipelines.',
  }),
  'CSCI 4840': new Course('CSCI 4840', 'Computer Vision', 4, {
    prereqs: ['CSCI 2720', 'MATH 3000'],
    description: 'Feature extraction, edge detection, optical flow, object detection (YOLO), convolutional visual recognition.',
  }),
  'CSCI 4860': new Course('CSCI 4860', 'Natural Language Processing', 4, {
    prereqs: ['CSCI 2720'],
    description: 'Tokenization, language models, word embeddings, transformer attention mechanisms, LLM fine-tuning.',
  }),
  'CSCI 4880': new Course('CSCI 4880', 'Deep Learning', 4, {
    prereqs: ['CSCI 2720', 'MATH 3000'],
    description: 'Backpropagation, CNNs, RNNs, Transformers, GANs, diffusion models, PyTorch GPU acceleration.',
  }),

  // COGNITIVE SCIENCE, LINGUISTICS & PHILOSOPHY COURSES
  'PHIL 2500': new Course('PHIL 2500', 'Symbolic Logic', 3, {
    prereqs: [],
    description: 'Formal logic, propositional calculus, predicate logic, deduction methods, formal proofs.',
  }),
  'PSYC 1101': new Course('PSYC 1101', 'Introduction to Psychology', 3, {
    prereqs: [],
    description: 'Fundamental principles of human behavior, cognition, learning, memory, and neurobiology.',
  }),
  'LING 2100': new Course('LING 2100', 'The Study of Language', 3, {
    prereqs: [],
    description: 'Phonetics, phonology, morphology, syntax, semantics, and language processing.',
  }),
  'ARTI 3010': new Course('ARTI 3010', 'Introduction to Artificial Intelligence and Cognitive Science', 3, {
    prereqs: ['CSCI 1301'],
    description: 'Knowledge representation, search algorithms, logic programming, neural networks, natural language processing.',
  }),
  'PHIL 4300': new Course('PHIL 4300', 'Philosophy of Mind', 3, {
    prereqs: ['PHIL 2500'],
    description: 'Mind-body problem, consciousness, intentionality, functionalism, computational theories of cognition.',
  }),
  'PSYC 4100': new Course('PSYC 4100', 'Cognitive Psychology', 3, {
    prereqs: ['PSYC 1101'],
    description: 'Human information processing, perception, attention, memory architectures, mental representations.',
  }),
  'PSYC 4120': new Course('PSYC 4120', 'Sensation and Perception', 3, {
    prereqs: ['PSYC 1101'],
    description: 'Physiological mechanisms and psychological processes in visual, auditory, and tactile perception.',
  }),
  'PHIL 4510': new Course('PHIL 4510', 'Deductive Systems', 3, {
    prereqs: ['PHIL 2500'],
    description: 'Metatheory of first-order logic, soundness, completeness, Gödel incompleteness theorems.',
  }),
  'PHIL 4310': new Course('PHIL 4310', 'Philosophy of Language', 3, {
    prereqs: ['PHIL 2500'],
    description: 'Theories of reference, truth conditions, speech acts, pragmatics, semantic compositionality.',
  }),
  'ARTI 4800': new Course('ARTI 4800', 'AI Programming and Knowledge Engineering', 3, {
    prereqs: ['ARTI 3010'],
    description: 'Ontologies, semantic web, Prolog logic programming, expert systems, rule-based reasoning.',
  }),
  'PSYC 4130': new Course('PSYC 4130', 'Cognitive Neuroscience', 3, {
    prereqs: ['PSYC 1101'],
    description: 'Neural substrates of memory, attention, decision making, functional neuroimaging methods.',
  }),
  'LING 3060': new Course('LING 3060', 'Phonetics and Phonology', 3, {
    prereqs: ['LING 2100'],
    description: 'Acoustic and articulatory phonetics, phonological rules, feature geometry, speech synthesis basics.',
  }),
  'LING 3150': new Course('LING 3150', 'Generative Syntax', 3, {
    prereqs: ['LING 2100'],
    description: 'X-bar theory, transformational grammar, minimalist syntax, phrase structure trees.',
  }),
  'LING 4570': new Course('LING 4570', 'Natural Language Processing', 3, {
    prereqs: ['LING 2100', 'CSCI 1301'],
    description: 'Computational linguistics, parsing algorithms, statistical semantics, corpus linguistics.',
  }),

  // BUSINESS & DATA ELECTIVES
  'FINA 3001': new Course('FINA 3001', 'Financial Management', 3, {
    description: 'Time value of money, capital budgeting, cost of capital, risk and return.',
  }),
  'MARK 3001': new Course('MARK 3001', 'Principles of Marketing', 3, {
    description: 'Marketing strategy, buyer behavior, segmentation, market research, digital channels.',
  }),
  'MARK 4350': new Course('MARK 4350', 'Marketing Analytics', 3, {
    prereqs: ['MARK 3001'],
    description: 'Customer lifetime value, churn modeling, marketing attribution, econometric marketing mix.',
  }),
  'MARK 4650': new Course('MARK 4650', 'Digital Marketing Analytics', 3, {
    prereqs: ['MARK 3001'],
    description: 'Web analytics, search engine optimization, conversion rate optimization, A/B testing platforms.',
  }),
  'MGMT 3001': new Course('MGMT 3001', 'Principles of Management', 3, {
    description: 'Organizational behavior, strategic planning, team leadership, change management.',
  }),
  'MIST 5730': new Course('MIST 5730', 'Advanced Data Management and Analytics', 3, {
    prereqs: ['CSCI 1301'],
    description: 'Enterprise data warehousing, dimensional modeling, ETL pipelines, business intelligence.',
  }),
  'RMIN 4000': new Course('RMIN 4000', 'Risk Management and Insurance', 3, {
    description: 'Identification, evaluation, and management of corporate and catastrophic risks.',
  }),
};

// ============================================================
// PROGRAM SPECIFICATIONS
// ============================================================

// 1. B.S. in Computer Science
export const COMPUTERSCIENCE_REQUIRED_KEYS = [
  'MATH 2250',
  'CSCI 1301',
  'CSCI 2610',
  'CSCI 3030',
  'CSCI 1302',
  'CSCI 1730',
  'CSCI 2670',
  'CSCI 2720',
  'CSCI 4720',
  'CSCI 4470',
  'CSCI 4050',
  'CSCI 4760',
];

const csRequiredCourses: Record<string, Course> = {};
for (const key of COMPUTERSCIENCE_REQUIRED_KEYS) {
  if (ALL_COURSES[key]) csRequiredCourses[key] = ALL_COURSES[key];
}

export const ComputerScienceProgram = new ComputingProgram({
  name: 'B.S. in Computer Science',
  shortName: 'B.S. CS',
  degreeType: 'Major',
  totalDegreeCredits: 120,
  requiredCourses: csRequiredCourses,
  electiveRule: new CompositeOrRule(
    [
      new AnyDepartmentLevelRule('CSCI', 4000, 4999, 4, 'Any 4000-level CSCI course (≥ 4 credit hours)'),
      new ExplicitCatalogRule(
        [
          'CSCI 2150', 'MATH 2260', 'MATH 2270', 'MATH 3000', 'MATH 3100', 'MATH 3200', 'MATH 3300',
          'MATH 3500', 'MATH 3510', 'MATH 4000', 'MATH 4010', 'MATH 4100', 'MATH 4110', 'MATH 4150',
          'MATH 4200', 'MATH 4220', 'MATH 4250', 'MATH 4400', 'MATH 4500', 'MATH 4510', 'MATH 4600',
          'MATH 4620', 'MATH 4670', 'MATH 4690', 'MATH 4700', 'MATH 4720', 'MATH 4760', 'MATH 4780',
          'MATH 4790', 'MATH 4850', 'STAT 2000', 'STAT 4210', 'STAT 4220', 'STAT 4230', 'STAT 4240',
          'STAT 4260', 'STAT 4270', 'STAT 4280', 'STAT 4290', 'STAT 4360', 'STAT 4365', 'STAT 4440',
          'STAT 4510', 'STAT 4520', 'STAT 4530', 'STAT 4620', 'STAT 4710', 'STAT 4720'
        ],
        'Approved CS Advanced Mathematics & Statistics Electives'
      ),
    ],
    'Any 4000-level CSCI course (4 hrs) OR Approved Advanced Math/Stat elective'
  ),
  electivesRequired: 4,
  electiveMinCredits: 3,
  catalogCourses: ALL_COURSES,
  description: 'School of Computing curriculum covering software development, systems, algorithms, and theory.',
});

// 2. Minor in Computer Science
export const MINOR_CS_REQUIRED_KEYS = ['CSCI 1301', 'CSCI 1302', 'CSCI 2610', 'CSCI 2720'];
const minorCsRequired: Record<string, Course> = {};
for (const key of MINOR_CS_REQUIRED_KEYS) {
  if (ALL_COURSES[key]) minorCsRequired[key] = ALL_COURSES[key];
}

export const ComputerScienceMinor = new ComputingProgram({
  name: 'Minor in Computer Science',
  shortName: 'Minor CS',
  degreeType: 'Minor',
  totalDegreeCredits: 19,
  requiredCourses: minorCsRequired,
  electiveRule: new AnyDepartmentLevelRule('CSCI', 3000, 4999, 3, 'Any 3000- or 4000-level CSCI course'),
  electivesRequired: 1,
  electiveMinCredits: 3,
  catalogCourses: ALL_COURSES,
  description: '19-credit computing minor in core software development, discrete math, data structures, and an elective.',
});

// 3. B.S. in Data Science
export const DATASCIENCE_REQUIRED_KEYS = [
  'MATH 2250',
  'MATH 2260',
  'MATH 2270',
  'STAT 2000',
  'CSCI 1301',
  'CSCI 3360',
  'CSCI 2610',
  'CSCI 1302',
  'MATH 3300',
  'CSCI 4360',
  'STAT 4365',
  'STAT 4230',
  'CSCI 2725',
  'CSCI 2670',
  'CSCI 4260',
  'STAT 4510',
  'CSCI 4370',
  'STAT 4220',
  'CSCI 4380',
  'STAT 4530',
  'STAT 5030',
];

const dsRequiredCourses: Record<string, Course> = {};
for (const key of DATASCIENCE_REQUIRED_KEYS) {
  if (ALL_COURSES[key]) dsRequiredCourses[key] = ALL_COURSES[key];
}

export const DataScienceProgram = new ComputingProgram({
  name: 'B.S. in Data Science',
  shortName: 'B.S. Data Science',
  degreeType: 'Major',
  totalDegreeCredits: 120,
  requiredCourses: dsRequiredCourses,
  electiveRule: new ExplicitCatalogRule(
    [
      'CSCI 3030', 'CSCI 4050', 'CSCI 4130', 'CSCI 4140', 'CSCI 4150', 'CSCI 4170', 'CSCI 4210',
      'CSCI 4300', 'CSCI 4330', 'CSCI 4470', 'CSCI 4570', 'CSCI 4750', 'CSCI 4780', 'CSCI 4800',
      'CSCI 4840', 'CSCI 4850', 'CSCI 4860', 'CSCI 4870', 'CSCI 4880',
      'FINA 3001', 'MARK 3001', 'MARK 4350', 'MARK 4650', 'MATH 4150', 'MATH 4500', 'MATH 4600',
      'MATH 4620', 'MATH 4670', 'MATH 4690', 'MATH 4700', 'MATH 4760', 'MATH 4780', 'MATH 4790',
      'MGMT 3001', 'MIST 5730', 'RMIN 4000', 'STAT 4240', 'STAT 4260', 'STAT 4270', 'STAT 4280',
      'STAT 4290', 'STAT 4360', 'STAT 4440', 'STAT 4620', 'STAT 4710', 'STAT 4720'
    ],
    'Approved Data Science Interdisciplinary Electives Catalog (4 courses required)'
  ),
  electivesRequired: 4,
  electiveMinCredits: 3,
  catalogCourses: ALL_COURSES,
  description: 'Interdisciplinary curriculum in statistical modeling, machine learning, and high-performance computing.',
});

// 4. B.S. in Statistics (Stat Major)
export const STAT_MAJOR_REQUIRED_KEYS = [
  'MATH 2250',
  'MATH 2260',
  'MATH 2270',
  'MATH 3000',
  'CSCI 1301',
  'STAT 2000',
  'STAT 4210',
  'STAT 4220',
  'STAT 4230',
  'STAT 4510',
  'STAT 4520',
];

const statMajorRequired: Record<string, Course> = {};
for (const key of STAT_MAJOR_REQUIRED_KEYS) {
  if (ALL_COURSES[key]) statMajorRequired[key] = ALL_COURSES[key];
}

export const StatisticsProgram = new ComputingProgram({
  name: 'B.S. in Statistics',
  shortName: 'B.S. Statistics',
  degreeType: 'Major',
  totalDegreeCredits: 120,
  requiredCourses: statMajorRequired,
  electiveRule: new AnyDepartmentLevelRule('STAT', 4000, 5999, 3, 'Any 4000-level STAT elective'),
  electivesRequired: 3,
  electiveMinCredits: 3,
  catalogCourses: ALL_COURSES,
  description: 'Comprehensive mathematical statistics, design of experiments, inference, and computational modeling.',
});

// 5. Minor in Statistics (Stat Minor)
export const STAT_MINOR_REQUIRED_KEYS = ['STAT 2000', 'STAT 4210', 'STAT 4220', 'STAT 4230'];
const statMinorRequired: Record<string, Course> = {};
for (const key of STAT_MINOR_REQUIRED_KEYS) {
  if (ALL_COURSES[key]) statMinorRequired[key] = ALL_COURSES[key];
}

export const StatisticsMinor = new ComputingProgram({
  name: 'Minor in Statistics',
  shortName: 'Minor Statistics',
  degreeType: 'Minor',
  totalDegreeCredits: 16,
  requiredCourses: statMinorRequired,
  electiveRule: new AnyDepartmentLevelRule('STAT', 4000, 5999, 3, 'Any 4000-level STAT course'),
  electivesRequired: 1,
  electiveMinCredits: 3,
  catalogCourses: ALL_COURSES,
  description: '16-credit statistics minor in data analysis, experimental designs, and applied regression.',
});

// 6. A.B. in Cognitive Science (Cog Sci Major)
export const COGSCI_MAJOR_REQUIRED_KEYS = [
  'CSCI 1301',
  'CSCI 1302',
  'PHIL 2500',
  'PSYC 1101',
  'LING 2100',
  'ARTI 3010',
  'PHIL 4300',
  'PSYC 4100',
];

const cogSciMajorRequired: Record<string, Course> = {};
for (const key of COGSCI_MAJOR_REQUIRED_KEYS) {
  if (ALL_COURSES[key]) cogSciMajorRequired[key] = ALL_COURSES[key];
}

export const CognitiveScienceProgram = new ComputingProgram({
  name: 'A.B. in Cognitive Science',
  shortName: 'A.B. Cognitive Science',
  degreeType: 'Major',
  totalDegreeCredits: 120,
  requiredCourses: cogSciMajorRequired,
  electiveRule: new ExplicitCatalogRule(
    [
      'CSCI 2720', 'CSCI 3360', 'CSCI 4380', 'CSCI 4800', 'CSCI 4830', 'CSCI 4840', 'CSCI 4860',
      'CSCI 4870', 'CSCI 4880', 'ARTI 4800', 'PHIL 4310', 'PHIL 4510', 'PSYC 4120', 'PSYC 4130',
      'LING 3060', 'LING 3150', 'LING 4570', 'STAT 2000', 'MATH 4600'
    ],
    'Approved Cognitive Science concentration electives'
  ),
  electivesRequired: 4,
  electiveMinCredits: 3,
  catalogCourses: ALL_COURSES,
  description: 'Interdisciplinary study of mind and intelligence spanning computing, AI, psychology, linguistics, and philosophy.',
});

// 7. Minor in Cognitive Science (Cog Sci Minor)
export const COGSCI_MINOR_REQUIRED_KEYS = ['CSCI 1301', 'PHIL 2500', 'PSYC 1101', 'LING 2100'];
const cogSciMinorRequired: Record<string, Course> = {};
for (const key of COGSCI_MINOR_REQUIRED_KEYS) {
  if (ALL_COURSES[key]) cogSciMinorRequired[key] = ALL_COURSES[key];
}

export const CognitiveScienceMinor = new ComputingProgram({
  name: 'Minor in Cognitive Science',
  shortName: 'Minor Cog Sci',
  degreeType: 'Minor',
  totalDegreeCredits: 15,
  requiredCourses: cogSciMinorRequired,
  electiveRule: new ExplicitCatalogRule(
    ['ARTI 3010', 'PHIL 4300', 'PSYC 4100', 'CSCI 1302'],
    'Approved Cognitive Science minor elective'
  ),
  electivesRequired: 1,
  electiveMinCredits: 3,
  catalogCourses: ALL_COURSES,
  description: '15-credit minor introducing symbolic logic, linguistics, introductory computing, and cognitive psychology.',
});

// 8. B.S. in Mathematics (Math Major)
export const MATH_MAJOR_REQUIRED_KEYS = [
  'MATH 2250',
  'MATH 2260',
  'MATH 2270',
  'MATH 3000',
  'MATH 3100',
  'MATH 3200',
  'MATH 4000',
  'MATH 4100',
  'CSCI 1301',
];

const mathMajorRequired: Record<string, Course> = {};
for (const key of MATH_MAJOR_REQUIRED_KEYS) {
  if (ALL_COURSES[key]) mathMajorRequired[key] = ALL_COURSES[key];
}

export const MathematicsProgram = new ComputingProgram({
  name: 'B.S. in Mathematics',
  shortName: 'B.S. Mathematics',
  degreeType: 'Major',
  totalDegreeCredits: 120,
  requiredCourses: mathMajorRequired,
  electiveRule: new AnyDepartmentLevelRule('MATH', 4000, 5999, 3, 'Any 4000-level MATH course'),
  electivesRequired: 3,
  electiveMinCredits: 3,
  catalogCourses: ALL_COURSES,
  description: 'Pure and applied mathematics curriculum covering analysis, algebra, multivariable calculus, and proofs.',
});

// 9. Minor in Mathematics (Math Minor)
export const MATH_MINOR_REQUIRED_KEYS = ['MATH 2250', 'MATH 2260', 'MATH 2270', 'MATH 3000', 'MATH 3200'];
const mathMinorRequired: Record<string, Course> = {};
for (const key of MATH_MINOR_REQUIRED_KEYS) {
  if (ALL_COURSES[key]) mathMinorRequired[key] = ALL_COURSES[key];
}

export const MathematicsMinor = new ComputingProgram({
  name: 'Minor in Mathematics',
  shortName: 'Minor Mathematics',
  degreeType: 'Minor',
  totalDegreeCredits: 17,
  requiredCourses: mathMinorRequired,
  electiveRule: new CompositeOrRule(
    [
      new AnyDepartmentLevelRule('MATH', 3000, 5999, 3, 'Any 3000/4000-level MATH course'),
      new ExplicitCatalogRule(
        ['STAT 4510', 'STAT 4520', 'STAT 4530', 'CSCI 2670', 'MATH 4600'],
        'Approved Mathematical Sciences Electives'
      ),
    ],
    'Any 3000/4000 MATH course OR Approved Mathematical Sciences Elective'
  ),
  electivesRequired: 1,
  electiveMinCredits: 3,
  catalogCourses: ALL_COURSES,
  description: '17-credit mathematics minor covering calculus I-III, linear algebra, and higher mathematical proofs.',
});

// Registered programs map (renamed to UGA Computing Programs)
export const ALL_PROGRAMS: Record<string, ComputingProgram> = {
  'B.S. in Computer Science': ComputerScienceProgram,
  'Minor in Computer Science': ComputerScienceMinor,
  'B.S. in Data Science': DataScienceProgram,
  'B.S. in Statistics': StatisticsProgram,
  'Minor in Statistics': StatisticsMinor,
  'A.B. in Cognitive Science': CognitiveScienceProgram,
  'Minor in Cognitive Science': CognitiveScienceMinor,
  'B.S. in Mathematics': MathematicsProgram,
  'Minor in Mathematics': MathematicsMinor,
};
