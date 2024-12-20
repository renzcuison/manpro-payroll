@extends('layout');

@section('content')
<h1 class="display-4">
    {{ $post->title }}
</h1>
<legend>{{ $post->excerpt }}</legend>
<p>{{ $post->body }}</p>
@endsection