import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// GET /api/surveys - list all surveys
app.get("/api/surveys", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, course_code, instructor, rating, comments, created_at FROM surveys_b5tp ORDER BY created_at DESC"
    );

    const rows = result.rows.map((r) => ({
      id: r.id,
      courseCode: r.course_code,
      instructor: r.instructor,
      rating: Number(r.rating),       // <-- convert from string to number
      comments: r.comments,
      createdAt: r.created_at,
    }));

    res.json(rows);
  } catch (error) {
    console.error("Error fetching surveys:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// GET /api/surveys/summary - simple stats
app.get("/api/surveys/summary", async (req, res) => {
  try {
    const summaryResult = await pool.query(
      `
      SELECT 
        COUNT(*)::int AS total_surveys,
        COALESCE(ROUND(AVG(rating)::numeric, 1), 0) AS average_rating,
        COALESCE(
          (
            SELECT course_code
            FROM surveys_b5tp
            GROUP BY course_code
            ORDER BY COUNT(*) DESC
            LIMIT 1
          ), ''
        ) AS most_reviewed_course
      FROM surveys_b5tp;
      `
    );

    const row = summaryResult.rows[0];
    res.json({
      totalSurveys: row.total_surveys,
      averageRating: Number(row.average_rating),
      mostReviewedCourse: row.most_reviewed_course
    });
  } catch (error) {
    console.error("Error fetching summary:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/surveys/:id - single survey
app.get("/api/surveys/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }

  try {
    const result = await pool.query(
      "SELECT id, course_code, instructor, rating, comments, created_at FROM surveys_b5tp WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Survey not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching survey:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Survey API running on http://localhost:${port}`);
});
