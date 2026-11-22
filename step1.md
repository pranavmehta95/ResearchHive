Build the frontend for a project named “ResearchHive”.

ResearchHive is a multi-agent literature review platform where users upload 3 to 5 research papers and receive an AI-generated literature review.

Use:
- React + Vite
- Tailwind CSS
- Lucide React icons
- Recharts for charts
- Do not use Streamlit.

Create a premium, modern academic-research dashboard. The design should feel like a polished SaaS product, not a student template.

Design requirements:
- Dark navy background with subtle blue-purple gradients.
- Accent colors: electric blue, violet, cyan.
- Clean glassmorphism cards with soft borders and shadows.
- Responsive desktop-first layout.
- Use excellent spacing, typography, hover states, loading skeletons, and smooth animations.
- Include a left sidebar with logo “ResearchHive”, navigation items: Dashboard, Papers, Analysis, Reports, Settings.
- Dashboard top section: welcome text, research-question input, and “Start Analysis” button.
- Upload area: drag-and-drop card for 3 to 5 PDF research papers, with uploaded-file cards showing file name, pages, and remove button.
- Include a “Use Demo Papers” button.
- Add a multi-agent workflow visualization with five agent cards:
  Paper Analyst, Methodology Analyst, Critique Agent, Citation Agent, Research Manager.
- Add a progress timeline that can show each agent’s current status.
- Create result tabs: Overview, Paper Insights, Comparison, Research Gaps, References.
- Include polished empty, loading, and error states.

For now, use realistic mock data only. Keep all components reusable and create clean files such as:
src/components/
src/pages/
src/data/mockData.js

Do not build the backend yet. Ensure the UI runs successfully.