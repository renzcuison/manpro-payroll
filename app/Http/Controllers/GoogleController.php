<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Google_Client;
use Google_Service_Calendar;
use Google_Service_Calendar_Event;
use Google_Service_Calendar_EventDateTime;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\PersonalAccessToken;

class GoogleController extends Controller
{
    // Redirect to Google OAuth
    public function redirectToGoogle(Request $request)
    {
        $token = $request->get('token');

        if (!$token) {
            return response()->json(['error' => 'Missing token.'], 400);
        }

        // Cache the token with short TTL
        Cache::put("google_oauth_token_temp", $token, now()->addMinutes(5));

        $client = $this->getGoogleClient();
        return redirect($client->createAuthUrl());
    }

    // Handle Google callback
    public function handleGoogleCallback(Request $request)
    {
        $client = $this->getGoogleClient();
        $tokenData = $client->fetchAccessTokenWithAuthCode($request->get('code'));
    
        if (isset($tokenData['error'])) {
            return response()->json(['error' => $tokenData['error_description']], 400);
        }
    
        // Get token from cache
        $apiToken = Cache::pull("google_oauth_token_temp");
    
        if (!$apiToken) {
            return response()->json(['error' => 'Auth token not found or expired.'], 401);
        }
    
        $sanctumToken = PersonalAccessToken::findToken($apiToken);
        $user = $sanctumToken?->tokenable;
    
        if (!$user) {
            return response()->json(['error' => 'User not found for token.'], 401);
        }
    
        $user->google_token = json_encode($tokenData);
        $user->save();
    
        return redirect('/admin/schedules'); // Or React success screen
    }

    // Add event to Google Calendar
    public function addEvent(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
        ]);
        $start = Carbon::parse($request->start_time)->toRfc3339String(); // ensures correct format
        $end = Carbon::parse($request->end_time)->toRfc3339String();
        $user = auth()->user();
    
        if (!$user->google_token) {
            return response()->json(['error' => 'Google account not connected.'], 403);
        }
    
        $token = json_decode($user->google_token, true);
    
        $client = $this->getGoogleClient();
        $client->setAccessToken($token);
    
        if ($client->isAccessTokenExpired()) {
            if (isset($token['refresh_token'])) {
                $newToken = $client->fetchAccessTokenWithRefreshToken($token['refresh_token']);
                $user->google_token = json_encode($client->getAccessToken());
                $user->save();
            } else {
                return response()->json(['error' => 'Access token expired. Please reconnect Google Calendar.'], 403);
            }
        }
    
        $service = new \Google_Service_Calendar($client);
    
        $event = new \Google_Service_Calendar_Event([
            'summary' => $request->title,
            'description' => $request->description,
            'start' => new Google_Service_Calendar_EventDateTime([
                'dateTime' => $start,
                'timeZone' => 'Asia/Manila',
            ]),
            'end' => new Google_Service_Calendar_EventDateTime([
                'dateTime' => $end,
                'timeZone' => 'Asia/Manila',
            ]),
        ]);
    
        try {
            $createdEvent = $service->events->insert('primary', $event);
            return response()->json([
                'message' => 'Event created successfully!',
                'event_id' => $createdEvent->id,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to create event.', 'details' => $e->getMessage()], 500);
        }
    }
    

    // Fetch events
    public function getEvents()
    {
        $user = auth()->user();
    
        if (!$user->google_token) {
            return response()->json(['error' => 'Google account not connected.'], 403);
        }
    
        $token = json_decode($user->google_token, true);
    
        $client = $this->getGoogleClient();
        $client->setAccessToken($token);
    
        if ($client->isAccessTokenExpired()) {
            if (isset($token['refresh_token'])) {
                $newToken = $client->fetchAccessTokenWithRefreshToken($token['refresh_token']);
                $user->google_token = json_encode($client->getAccessToken());
                $user->save();
            } else {
                return response()->json(['error' => 'Access token expired. Please reconnect.'], 403);
            }
        }
    
        $service = new \Google_Service_Calendar($client);
    
        try {
            $events = $service->events->listEvents('primary', [
                'timeMin' => now()->toRfc3339String(),
                'maxResults' => 20,
                'singleEvents' => true,
                'orderBy' => 'startTime'
            ]);
    
            $eventList = [];
    
            foreach ($events->getItems() as $event) {
                $eventList[] = [
                    'id' => $event->getId(),
                    'title' => $event->getSummary(),
                    'start' => optional($event->getStart())->getDateTime() ?? $event->getStart()->getDate(),
                    'end' => optional($event->getEnd())->getDateTime() ?? $event->getEnd()->getDate(),
                    'description' => $event->getDescription(),
                ];
            }
    
            return response()->json($eventList);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to retrieve events.', 'details' => $e->getMessage()], 500);
        }
    }
    

    // Common function to create a Google client
    private function getGoogleClient()
    {
        $client = new Google_Client();
        $client->setClientId(env('GOOGLE_CLIENT_ID'));
        $client->setClientSecret(env('GOOGLE_CLIENT_SECRET'));
        $client->setRedirectUri(env('GOOGLE_REDIRECT_URI'));
        $client->addScope(Google_Service_Calendar::CALENDAR);
        $client->setAccessType('offline');
        $client->setPrompt('consent');

        return $client;
    }
}