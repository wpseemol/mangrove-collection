<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="light">

<head>
    @include('partials.general-users')
</head>

<body class="">

    <x-layouts::home.header />

    {{ $slot }}

    <x-layouts::home.footer />
</body>

</html>