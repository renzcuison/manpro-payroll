import { useParams } from "react-router-dom";

const ExamDetail = () => {
  const { id } = useParams();

  return (
    <div>
      <h1>Exam Detail</h1>
      <p>Exam ID: {id}</p>
      {/* Fetch and show data based on ID */}
    </div>
  );
};

export default ExamDetail;