# ai_service.py
from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Dict, Any
import re

class MatchingService:
    def __init__(self):
        print("Loading AI model...")
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        print("Model loaded successfully!")

    def generate_vector(self, text: str) -> List[float]:
        """Convert text to vector embedding"""
        if not text:
            text = ""
        vector = self.model.encode(text)
        return vector.tolist()

    # ── Location helpers ──────────────────────────────────────────────────────

    @staticmethod
    def _tokenize(text: str) -> set:
        """Lowercase word tokens, strip punctuation"""
        return set(re.findall(r'[a-z]+', text.lower())) if text else set()

    def _location_match_score(self, labor_loc: str, job_loc: str) -> float:
        """
        Fuzzy text location match → returns 0.0 – 1.0.
        Uses Jaccard token overlap + substring bonus to handle typos and partial names.
        e.g. 'hydrabad' vs 'Hyderabad, Telangana' → substring partial match → 0.4+
        """
        if not labor_loc or not job_loc:
            return 0.0

        q_tokens = self._tokenize(labor_loc)
        j_tokens = self._tokenize(job_loc)

        if not q_tokens:
            return 0.0

        # Jaccard similarity
        intersection = q_tokens & j_tokens
        union = q_tokens | j_tokens
        jaccard = len(intersection) / len(union) if union else 0.0

        # Substring bonus: handles partial match ("hyd" in "hyderabad")
        q_lower = labor_loc.lower().strip()
        j_lower = job_loc.lower().strip()
        sub_bonus = 0.35 if (q_lower in j_lower or j_lower in q_lower) else 0.0

        # Per-token soft match: each labor token checked if it's a substring of any job token
        soft_matches = sum(
            1 for qt in q_tokens if any(qt in jt or jt in qt for jt in j_tokens)
        )
        soft_score = (soft_matches / len(q_tokens)) * 0.25 if q_tokens else 0.0

        return min(1.0, jaccard + sub_bonus + soft_score)

    # ── Main scoring ──────────────────────────────────────────────────────────

    def calculate_match_score(self, job: Dict, labor: Dict) -> Dict[str, Any]:
        """Calculate comprehensive match score with explanation"""

        # 1. Semantic similarity (60% weight)
        job_vec = np.array(job.get('job_vector', [0]*384))
        labor_vec = np.array(labor.get('profile_vector', [0]*384))

        if np.any(job_vec) and np.any(labor_vec):
            similarity = np.dot(job_vec, labor_vec) / (np.linalg.norm(job_vec) * np.linalg.norm(labor_vec))
            semantic_score = float(similarity) * 60
        else:
            semantic_score = 0

        # 2. Wage match (20% weight)
        job_wage = job.get('wage', 0)
        labor_rate = labor.get('daily_rate', 0)

        if job_wage > 0 and labor_rate > 0:
            wage_ratio = min(job_wage, labor_rate) / max(job_wage, labor_rate)
            wage_score = wage_ratio * 20
            wage_explanation = f"Wage: ₹{labor_rate}/day expected vs ₹{job_wage}/day offered"
        else:
            wage_score = 0
            wage_explanation = "Wage information incomplete"

        # 3. Location text match (20% weight)
        labor_loc = labor.get('location', '') or ''
        job_loc = job.get('location', '') or ''
        loc_ratio = self._location_match_score(labor_loc, job_loc)
        location_score = loc_ratio * 20

        if loc_ratio >= 0.7:
            location_explanation = f"Great location match: '{labor_loc}' ↔ '{job_loc}'"
        elif loc_ratio >= 0.3:
            location_explanation = f"Partial location match: '{labor_loc}' near '{job_loc}'"
        elif loc_ratio > 0:
            location_explanation = f"Weak location overlap: '{labor_loc}' vs '{job_loc}'"
        elif labor_loc and job_loc:
            location_explanation = f"Different locations: '{labor_loc}' vs '{job_loc}'"
        else:
            location_explanation = "Location not specified"

        # 4. Skills keyword bonus (up to 20 bonus pts)
        job_desc = job.get('description', '').lower()
        labor_skills = labor.get('skills', '').lower()

        skill_bonus = 0
        skill_matches = []
        common_skills = [
            'plowing', 'harvesting', 'planting', 'irrigation', 'fertilizer',
            'tractor', 'driving', 'repair', 'maintenance', 'pesticide',
            'weeding', 'crop', 'dairy', 'horticulture', 'drip'
        ]
        for skill in common_skills:
            if skill in job_desc and skill in labor_skills:
                skill_bonus += 2
                skill_matches.append(skill)

        total_score = min(100, semantic_score + wage_score + location_score + skill_bonus)

        explanation = f"Match Score: {total_score:.1f}%\n"
        explanation += f"• Semantic fit: {semantic_score:.1f}/60\n"
        explanation += f"• {wage_explanation}\n"
        explanation += f"• {location_explanation}\n"
        if skill_matches:
            explanation += f"• Skills matched: {', '.join(skill_matches)}"

        return {
            'score': total_score,
            'explanation': explanation,
            'components': {
                'semantic': semantic_score,
                'wage': wage_score,
                'location': location_score,
                'skill_bonus': skill_bonus
            }
        }

# Create global instance
matching_service = MatchingService()
