import {
    Paper
} from '@mui/material';
import { useEvaluationFormCategory } from '../../../../hooks/useEvaluationFormCategory';

const PerformanceEvaluationFormCategory = ({ category }) => {

    const {
        categoryId, categoryName, order, subcategories,
        saveSubcategory
    } = useEvaluationFormCategory( category );
    const hasSubcategories = subcategories.length > 0;
    
    return <>
        <Paper
            sx={{
                mb: 1,
                p: 2,
                bgcolor: "#fff8e1",
                borderLeft: "5px solid #eab31a",
                fontWeight: "bold"
            }}
            elevation={1}
        >
            {categoryName}
        </Paper>
    </>;

};

export default PerformanceEvaluationFormCategory;
