<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ManPro Management</title>
</head>

<body>
    <div style="margin: 10px 5% 10px;background-color: #008018; border-radius: 10px; padding: 5px 5px 5px;">
        <div style="justify-content: center; align-items: center; text-align: center; margin: 10px">
            <img src="https://manpromanagement.com/images/ManPro.png" style="width: 15%; border: 3px solid white; border-radius: 10px; background-color: white;">
        </div>
        <div style="background-color: white">
            <div class="parent" style="overflow: hidden; display: flex; align-items: center; justify-content: center; padding: 5px">
                <img src="https://manpromanagement.com/images/emailbanner.jpg" style="width: 100%;">
            </div>
            <table width="100%" border="0" cellspacing="0" cellpadding="20" style=" color: #5a5f61; font-family:verdana;">
                <tr>
                    <td>
                        <div>Dear {{ $details['name'] }}!&nbsp;</div>
                        <div><br></div>
                        <div>We are thrilled to welcome you to <b>{{ $details['company'] }}</b>! You have successfully registered.
                            <div><br></div>
                            Getting started is easy! Simply log in to your account using the following link below. You can use your provided username and password to access all the features and resources at ManPro.
                            &nbsp;<br><br>
                            If you have any questions or encounter any issues while using your ManPro account, please don't hesitate to reach out to your HR manager.
                            &nbsp;
                        </div>
                    </td>
                </tr>
            </table>
            <div style="text-align: center; padding: 20px 0px; color: #fff; background-color: #008018; font-family:verdana">
                Your Gateway to Innovative Management Solutions for Businesses in the Philippines<br>
                support@manpro.ph<br>
                <a href="https://manpro.ph/" style="color: white;">https://manpro.ph/</a>
            </div>
        </div>
    </div>
</body>

</html>