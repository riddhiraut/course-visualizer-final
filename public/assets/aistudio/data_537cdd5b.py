from classes import Course, ComputingProgram


# ============================================================
# B.S. in Data Science
# ============================================================

datascience_required = {
    "MATH 2250": Course("MATH 2250", "Calculus I for Science and Engineering", 4, []),
    "MATH 2260": Course("MATH 2260", "Calculus II for Science and Engineering", 4, ["MATH 2250"]),
    "MATH 2270": Course("MATH 2270", "Calculus III", 4, ["MATH 2260"]),
    "STAT 2000": Course("STAT 2000", "Introductory Statistics", 4, []),
    "CSCI 1301": Course("CSCI 1301", "Intro to Computing and Programming", 4, []),
    "CSCI 3360": Course("CSCI 3360", "Data Science & Applied Machine Learning I", 4, ["CSCI 1301", "MATH 2250"]),
    "CSCI 2610": Course("CSCI 2610", "Discrete Mathematics for Computer Science", 4, []),
    "CSCI 1302": Course("CSCI 1302", "Software Development", 4, ["CSCI 1301"]),
    "MATH 3300": Course("MATH 3300", "Applied Linear Algebra", 3, ["MATH 2260"]),
    "CSCI 4360": Course("CSCI 4360", "Data Science II", 4, ["CSCI 3360"]),
    "STAT 4365": Course("STAT 4365", "Modern Statistical Programming", 3, ["STAT 2000"]),
    "STAT 4230": Course("STAT 4230", "Applied Regression Analysis", 3, ["STAT 2000", "MATH 2250"]),
    "CSCI 2725": Course("CSCI 2725", "Data Structures for Data Science", 4, ["CSCI 1302", "CSCI 2610"]),
    "CSCI 2670": Course("CSCI 2670", "Introduction to Theory of Computing", 4, ["CSCI 2610"]),
    "CSCI 4260": Course("CSCI 4260", "Data Security and Privacy", 4, ["CSCI 2725"]),
    "STAT 4510": Course("STAT 4510", "Mathematical Statistics I", 3, ["MATH 2270"]),
    "CSCI 4370": Course("CSCI 4370", "Database Management", 4, ["CSCI 2725"]),
    "STAT 4220": Course("STAT 4220", "Applied Experimental Designs", 3, ["STAT 4230"]),
    "CSCI 4380": Course("CSCI 4380", "Data Mining", 4, ["CSCI 2725"]),
    "STAT 4530": Course("STAT 4530", "Statistical Inference for Data Scientists", 3, ["CSCI 3360", "STAT 4510"]),
    "STAT 5030": Course("STAT 5030", "Data Sciece Capstone Course", 3, ["STAT 4230"]),
}

datascience_electives = {
    "CSCI 3030": Course("CSCI 3030", "Computing, Ethics, and Society", 3),
    "CSCI 4050": Course("CSCI 4050", "Software Engineering", 4,
                        prereqs=["CSCI 2725"]),
    "CSCI 4150": Course("CSCI 4150", "Numerical Simulations in Science and Engineering", 4,
                        prereqs=["CSCI 1302", "MATH 2270"]),
    "CSCI 4170": Course("CSCI 4170", "Introduction to Computational Investing", 4,
                        prereqs=["CSCI 1302", "MATH 3300"]),
    "CSCI 4210": Course("CSCI 4210", "Simulation and Modeling", 4,
                        prereqs=["CSCI 1302", "STAT 2000"]),
    "CSCI 4470": Course("CSCI 4470", "Algorithms", 4,
                        prereqs=["CSCI 2670", "CSCI 2725"]),
    "CSCI 4850": Course("CSCI 4850", "Biomedical Image Analysis", 4,
                        prereqs=["CSCI 1302"]),
    "FINA 3001": Course("FINA 3001", "Financial Management", 3),
    "MARK 3001": Course("MARK 3001", "Principles of Marketing", 3),
    "MARK 4350": Course("MARK 4350", "Marketing Analytics", 3,
                        prereqs=["MARK 3001"]),
    "MARK 4650": Course("MARK 4650", "Digital Marketing Analytics", 3,
                        prereqs=["MARK 3001"]),
    "MATH 4690": Course("MATH 4690", "Graph Theory", 3,
                        prereqs=["CSCI 2610"]),
    "MGMT 3001": Course("MGMT 3001", "Principles of Management", 3),
    "MIST 5730": Course("MIST 5730", "Advanced Data Management and Analytics", 3,
                        prereqs=["CSCI 1301"]),
    "RMIN 4000": Course("RMIN 4000", "Risk Management and Insurance", 3),
    "STAT 4240": Course("STAT 4240", "Sampling and Survey Methods", 3,
                        prereqs=["STAT 2000"]),
    "STAT 4260": Course("STAT 4260", "Statistical Quality Assurance", 3,
                        prereqs=["STAT 2000"]),
    "STAT 4270": Course("STAT 4270", "Network Data Analysis and Graphical Models", 3,
                        prereqs=["STAT 2000"]),
    "STAT 4280": Course("STAT 4280", "Applied Time Series Analysis", 3,
                        prereqs=["STAT 4230"]),
    "STAT 4290": Course("STAT 4290", "Nonparametric Methods", 3,
                        prereqs=["STAT 4230"]),
    "STAT 4440": Course("STAT 4440", "Design and Analysis of Complex Computer Models", 3,
                        prereqs=["STAT 4230"]),
    "STAT 4620": Course("STAT 4620", "Applied Categorical Data Analysis", 3,
                        prereqs=["STAT 4230"]),
    "STAT 4710": Course("STAT 4710", "Introduction to Probability Theory I", 3,
                        prereqs=["MATH 2270"]),
    "STAT 4720": Course("STAT 4720", "Introduction to Probability Theory II", 3,
                        prereqs=["STAT 4710"]),
}

datascience_major = ComputingProgram(
    name="B.S. in Data Science",
    courses=datascience_required,
    electives=datascience_electives,
    electives_required=4,
)


# ============================================================
# B.S. in Computer Science
# ============================================================

computerscience_required = {
    "MATH 2250": Course("MATH 2250", "Calculus I for Science and Engineering", 4, []),
    "CSCI 1301": Course("CSCI 1301", "Intro to Computing and Programming", 4, []),
    "CSCI 2610": Course("CSCI 2610", "Discrete Mathematics for Computer Science", 4, []),
    "CSCI 3030": Course("CSCI 3030", "Computing, Ethics, and Society", 3),
    "CSCI 1302": Course("CSCI 1302", "Software Development", 4, ["CSCI 1301"]),
    "CSCI 1730": Course("CSCI 1730", "Systems Programming", 4, ["CSCI 1302"]),
    "CSCI 2670": Course("CSCI 2670", "Theory of Computation", 4, ["CSCI 2610"]),
    "CSCI 2720": Course("CSCI 2720", "Data Structures", 4, ["CSCI 2610", "CSCI 1302"]),
    "CSCI 4720": Course("CSCI 4720", "Computer Architecture", 4, ["CSCI 2670", "CSCI 1730"]),
    "CSCI 4470": Course("CSCI 4470", "Algorithms", 4, ["CSCI 2670", "CSCI 2720"]),
    "CSCI 4050": Course("CSCI 4050", "Software Engineering", 4, ["CSCI 2720"]),
    "CSCI 4760": Course("CSCI 4760", "Computer Networks", 4, ["CSCI 2670", "CSCI 2720"]),
    "CSCI 4XXX 1": Course("CSCI 4XXX", "Some other 4000 level CSCI class 1", 4, prereqs=[]),
    "CSCI 4XXX 2": Course("CSCI 4XXX", "Some other 4000 level CSCI class 2", 4, prereqs=[]),
    "CSCI 4XXX 3": Course("CSCI 4XXX", "Some other 4000 level CSCI class 3", 4, prereqs=[]),
    "CSCI 4XXX 4": Course("CSCI 4XXX", "Some other 4000 level CSCI class 4", 4, prereqs=[]),
}

computerscience_electives = {
    "CSCI 2150": Course("CSCI 2150", "Introduction to Computational Science", 4,
                        prereqs=[]),
    "CSCI 4150": Course("CSCI 4150", "Numerical Simulations in Science and Engineering", 4,
                        prereqs=["CSCI 1302", "MATH 2270"]),
    "MATH 2260": Course("MATH 2260", "Calculus II for Science and Engineering", 4,
                        prereqs=["MATH 2250"]),
    "MATH 2270": Course("MATH 2270", "Calculus III", 4,
                        prereqs=["MATH 2260"]),
    "MATH 2400": Course("MATH 2400", "Differential Calculus with Theory", 4,
                        prereqs=["MATH 1113"]),
    "MATH 2410": Course("MATH 2410", "Integral Calculus with Theory", 4,
                        prereqs=["MATH 2400"]),
    "MATH 2500": Course("MATH 2500", "Multivariable Calculus", 3,
                        prereqs=["MATH 2260"]),
    "MATH 2700": Course("MATH 2700", "Elementary Differential Equations", 3,
                        prereqs=["MATH 2260"]),
    "MATH 3000": Course("MATH 3000", "Introduction to Linear Algebra", 3,
                        prereqs=["MATH 3200"]),
    "MATH 3300": Course("MATH 3300", "Applied Linear Algebra", 3,
                        prereqs=["MATH 2260"]),
    "MATH 3500": Course("MATH 3500", "Multivariable Mathematics I", 4,
                        prereqs=["MATH 2260"]),
    "MATH 3510": Course("MATH 3510", "Multivariable Mathematics II", 4,
                        prereqs=["MATH 3500"],
                        aliases=["MATH 3510/MATH 3510H", "MATH 3510H"]),
    "STAT 2000": Course("STAT 2000", "Introductory Statistics", 4, []),
    "STAT 4210": Course("STAT 4210", "Statistical Methods", 3,
                        prereqs=["STAT 2000"]),
}


computerscience_major = ComputingProgram(
     name="B.S. in Computer Science",
     courses=computerscience_required,
     electives=computerscience_electives,
     electives_required=4,
)

PROGRAMS = {
    "B.S. in Data Science": datascience_major,
    "B.S. in Computer Science": computerscience_major,
}
