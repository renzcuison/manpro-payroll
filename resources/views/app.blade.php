<!doctype html>
<html lang="{{ config('app.locale') }}" class="no-focus">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no">

    <title>ManPro Management</title>

    <meta name="description" content="Smart Business Management">
    <meta name="author" content="InfinityHub">
    <meta name="robots" content="noindex, nofollow">

    <!-- CSRF Token -->
    {{-- <meta name="csrf-token" content="{{ csrf_token() }}"> --}}

    <!-- Icons -->
    <link rel="icon" sizes="192x100" type="image/png" href="{{ asset('media/ManProTab.png') }}">
    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('media/favicons/apple-touch-icon-180x180.png') }}">
    {{-- <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" /> --}}
    <!-- Fonts and Styles -->
    {{-- @yield('css_before') --}}
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Muli:300,400,400i,600,700">
    <link rel="stylesheet" id="css-main" href="{{ asset('/css/codebase.css') }}">
    {{-- <link rel="stylesheet" id="css-main" href="{{ asset('/css/codebase.min.css') }}"> --}}
    {{-- @yield('css_after') --}}

    <!-- Cache Busting -->
    <!-- <link rel="stylesheet" href="{{ mix('css/app.css') }}"> -->
</head>

<body>
    <div id="app"></div>
    <script src="{{ mix('js/app.js') }}"></script>
    <script src="https://www.youtube.com/iframe_api"></script>
</body>

</html>