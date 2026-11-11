import pytest
from classes import Course, ComputingProgram, StudentPlanner

# build a tiny fake program for testing
@pytest.fixture
def tiny_program():
    courses = {
        "CSCI 1301": Course("CSCI 1301", "Intro", 4, []),
        "CSCI 1302": Course("CSCI 1302", "Software Dev", 4, ["CSCI 1301"]),
        "CSCI 2725": Course("CSCI 2725", "Data Structures", 4, ["CSCI 1302"]),
    }
    electives = {
        "CSCI 4050": Course("CSCI 4050", "Software Eng", 4, prereqs=["CSCI 1302"]),
        "MATH 4690": Course("MATH 4690", "Graph Theory", 3, prereqs=[]),
    }
    return ComputingProgram(
        name="Test Program",
        courses=courses,
        electives=electives,
        electives_required=1,
    )

# TEST 1: a course with no pre-reqs should be unlocked from the start
def test_course_with_no_prereqs_is_unlocked(tiny_program):
    planner = StudentPlanner(tiny_program)
    unlocked = planner.get_unlocked_remaining()
    # csci 1301 should be unlocked
    assert "CSCI 1301" in unlocked

# TEST 2: a course with an incomplete prereq should be locked
def test_course_with_missing_prereq_is_locked(tiny_program):
    planner = StudentPlanner(tiny_program)
    unlocked = planner.get_unlocked_remaining()
    # csci 1302 should be locked
    assert "CSCI 1302" not in unlocked

# TEST 3: completing the prereq should unlock the next course
def test_completing_prereq_unlocks_next_course(tiny_program):
    planner = StudentPlanner(tiny_program)
    planner.update_status(["CSCI 1301"])  # csci 1301 marked complete
    unlocked = planner.get_unlocked_remaining()
    # csci 1302 should be unlocked
    assert "CSCI 1302" in unlocked

# TEST 4: remaining courses shouldn't include completed ones
def test_completed_course_disappears_from_remaining(tiny_program):
    planner = StudentPlanner(tiny_program)
    planner.update_status(["CSCI 1301"])
    remaining = planner.get_remaining()
    # csci 1301 shouldnt show up
    assert "CSCI 1301" not in remaining

# TEST 5: an elective should be locked if its prereq isn't met
def test_elective_with_missing_prereq_is_locked(tiny_program):
    planner = StudentPlanner(tiny_program)
    unlocked_electives = planner.get_unlocked_electives()
    # csci 4050 should be locked
    assert "CSCI 4050" not in unlocked_electives

# TEST 6: picking an elective should remove it from the available electives list
def test_selected_elective_disappears_from_unlocked(tiny_program):
    planner = StudentPlanner(tiny_program)
    # math 4690 has no prereqs open, so it gets picked
    assert "MATH 4690" in planner.get_unlocked_electives()
    planner.set_electives(["MATH 4690"])
    # math 4960 shouldnt be available in unlocked list
    assert "MATH 4690" not in planner.get_unlocked_electives()
