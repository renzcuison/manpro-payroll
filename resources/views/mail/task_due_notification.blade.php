<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Task Due Today Reminder</title>
    <style>
        body {
            font-family: Arial, sans-serif;
        }

        h1 {
            color: #333;
        }

        p {
            margin-bottom: 10px;
        }

        ul {
            list-style-type: disc;
            margin-left: 20px;
        }

        li {
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <h1>Task Due Today Reminder</h1>

    <p>Hello, {{ $user->fname }}!</p>

    <p>This email is to remind you have a task that is due for today</p>

    <p>Kindly check your due tasks in the portal, Please make sure to complete these tasks by the deadline.</p>

    <p>Thank you!</p>
</body>
</html>