"""
Task 6.2: Python Formatting, PEP8 Conventions & Type Annotations
Student: Pulkit Goyal | CUID: CU24250263 | Roll 40 | Section A
"""
from typing import Dict, List, Optional
from datetime import datetime


class StudentEvaluation:
    """Represents a student laboratory evaluation record with typing."""

    def __init__(
        self,
        student_name: str,
        cuid: str,
        roll_number: int,
        section: str,
    ) -> None:
        self.student_name = student_name
        self.cuid = cuid
        self.roll_number = roll_number
        self.section = section
        self.scores: Dict[str, float] = {}

    def add_score(self, lab_name: str, score: float) -> None:
        """Records a verified laboratory practical score (0.0 to 100.0)."""
        if not (0.0 <= score <= 100.0):
            raise ValueError(f"Score {score} out of valid range (0-100).")
        self.scores[lab_name] = score

    def calculate_average(self) -> Optional[float]:
        """Calculates arithmetic mean of recorded lab scores."""
        if not self.scores:
            return None
        return sum(self.scores.values()) / len(self.scores)

    def summary(self) -> Dict[str, object]:
        """Returns structured dictionary summary of the evaluation."""
        return {
            "student": self.student_name,
            "cuid": self.cuid,
            "roll": self.roll_number,
            "section": self.section,
            "completed_labs": len(self.scores),
            "average_score": self.calculate_average(),
            "timestamp": datetime.now().isoformat(),
        }


def main() -> None:
    """Execution test entry point."""
    student = StudentEvaluation(
        student_name="Pulkit Goyal",
        cuid="CU24250263",
        roll_number=40,
        section="A",
    )
    student.add_score("Lab 1 - Semantic HTML5", 98.0)
    student.add_score("Lab 2 - CSS3 Responsive", 96.5)
    student.add_score("Lab 3 - React Todo App", 99.0)
    student.add_score("Lab 4 - React E-Commerce", 97.5)
    student.add_score("Lab 5 - Form Validation", 98.5)

    print("=== Student Lab Evaluation Summary ===")
    for key, value in student.summary().items():
        print(f"  {key}: {value}")


if __name__ == "__main__":
    main()
