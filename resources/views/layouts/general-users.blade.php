<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="light">

<head>
    @include('partials.general-users')
</head>

<body class="">

    <x-layouts::home.header />
    <main class="container mx-auto py-10">
        {{ $slot }}
    </main>

    <x-layouts::home.footer />
</body>

</html>