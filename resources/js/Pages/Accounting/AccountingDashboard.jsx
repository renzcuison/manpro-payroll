import { Button, Card, CardBody, Col, Collapse, Row } from "reactstrap";
import AccountingLayout from "../../Layouts/AccountingLayouts/AccountingLayout";
import { useDashboard } from "./hooks/useDashboard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReceiptIcon from "@mui/icons-material/Receipt";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { Backdrop, CircularProgress, Paper, Typography } from "@mui/material";
import { Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const AccountingDashboard = () => {
    const { data, isFetching, isFetched } = useDashboard();

    const labels = isFetched
        ? data.expenses.map((expense) => expense.title)
        : [];
    const expenseData = data?.expenses?.map((expense) => expense.value);
    const chartData = isFetched
        ? {
              labels: labels,
              datasets: [
                  {
                      data: expenseData,
                      backgroundColor: [
                          "rgba(255, 99, 132, 0.2)",
                          "rgba(54, 162, 235, 0.2)",
                          "rgba(255, 206, 86, 0.2)",
                      ],
                      borderColor: [
                          "rgba(255, 99, 132, 1)",
                          "rgba(54, 162, 235, 1)",
                          "rgba(255, 206, 86, 1)",
                      ],
                      borderWidth: 1,
                  },
              ],
          }
        : {};
    return (
        <AccountingLayout>
            <Backdrop
                sx={{
                    color: "#fff",
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={isFetching}
            >
                <CircularProgress color="success" />
            </Backdrop>
            <Row>
                {!isFetching &&
                    data.totals.map((total) => {
                        const formattedNumber = total.value.toLocaleString(
                            "en-US",
                            { style: "currency", currency: "USD" }
                        );
                        let icon;
                        switch (total.slug) {
                            case "expense":
                                icon = <PaymentsIcon fontSize="large" />;
                                break;
                            case "liability":
                                icon = <ReceiptIcon fontSize="large" />;
                                break;
                            case "net":
                                icon = <MonetizationOnIcon fontSize="large" />;
                                break;

                            default:
                                icon = (
                                    <AccountBalanceWalletIcon fontSize="large" />
                                );
                                break;
                        }
                        return (
                            <Col sm={6} xl={3} key={total.name}>
                                <Card
                                    body
                                    style={{
                                        backgroundColor: "white",
                                        padding: 20,
                                    }}
                                >
                                    <div className="float-right mt-15 d-none d-sm-block">
                                        {icon}
                                    </div>
                                    <div className="font-size-h4 font-w600 text-primary">
                                        {formattedNumber}
                                    </div>
                                    <div className="font-size-xs font-w600 text-uppercase text-muted">
                                        {total.name}
                                    </div>
                                </Card>
                            </Col>
                        );
                    })}
            </Row>
            <Row style={{ marginTop: 10 }}>
                <Col xs={8}></Col>
                <Col xs={4}>
                    {isFetched && (
                        <Paper variant="outlined" sx={{ padding: 2 }}>
                            <Pie data={chartData} />
                            <Row className="mt-10 items-push">
                                <Col xs={6}>
                                    <p
                                        className="text-uppercase font-weight-bold"
                                        style={{ fontSize: 10 }}
                                    >
                                        Liability Expense
                                    </p>
                                    <div className="d-flex align-items-center">
                                        <div
                                            className="rounded-circle mr-5"
                                            style={{
                                                width: 10,
                                                height: 10,
                                                backgroundColor:
                                                    "rgba(255, 99, 132, 0.2)",
                                                borderColor:
                                                    "rgba(255, 99, 132, 1)",
                                            }}
                                        ></div>
                                        <h5 className="mb-0">
                                            $20{" "}
                                            <small className="text-muted">
                                                1%
                                            </small>
                                        </h5>
                                    </div>
                                </Col>
                                <Col xs={6}>
                                    <p
                                        className="text-uppercase font-weight-bold"
                                        style={{ fontSize: 10 }}
                                    >
                                        Personal Expense
                                    </p>
                                    <div className="d-flex align-items-center">
                                        <div
                                            className="rounded-circle mr-5"
                                            style={{
                                                width: 10,
                                                height: 10,
                                                backgroundColor:
                                                    "rgba(54, 162, 235, 0.2)",
                                                borderColor:
                                                    "rgba(54, 162, 235, 1)",
                                            }}
                                        ></div>
                                        <h5 className="mb-0">
                                            $20{" "}
                                            <small className="text-muted">
                                                1%
                                            </small>
                                        </h5>
                                    </div>
                                </Col>
                                <Col xs={6}>
                                    <p
                                        className="text-uppercase font-weight-bold"
                                        style={{ fontSize: 10 }}
                                    >
                                        Total Discount
                                    </p>
                                    <div className="d-flex align-items-center">
                                        <div
                                            className="rounded-circle mr-5"
                                            style={{
                                                width: 10,
                                                height: 10,
                                                backgroundColor:
                                                    "rgba(255, 206, 86, 0.2)",
                                                borderColor:
                                                    "rgba(255, 206, 86, 1)",
                                            }}
                                        ></div>
                                        <h5 className="mb-0">
                                            $20{" "}
                                            <small className="text-muted">
                                                1%
                                            </small>
                                        </h5>
                                    </div>
                                </Col>
                            </Row>
                        </Paper>
                    )}
                </Col>
            </Row>
        </AccountingLayout>
    );
};

export default AccountingDashboard;
