@extends('layout');

@section('content')
<ul class="list-unstyled">
   @foreach ($posts as $post)
       <li>
           <h1 class="display-4"><a href="/posts/{{ $post->id }}">{{ $post->title }}</a></h1>
           <legend>{{ $post->excerpt }}</legend>
        </li>
   @endforeach 
</ul>
@endsection