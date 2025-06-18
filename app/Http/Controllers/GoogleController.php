<?php

namespace App\Http\Controllers;

use App\Models\PublicEvent;
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
    
        if ($request->visibility === 'public') {
            PublicEvent::create([
                'user_id' => $user->id,
                'title' => $request->title,
                'description' => $request->description,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
            ]);
            return response()->json(['message' => 'Public event saved to DB.']);
        }
        
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
    
    public function updateEvent(Request $request, $id)
    {
        $user = auth()->user();

        $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'start_time' => 'required|date',
            'end_time' => 'required|date',
            'visibility' => 'required|in:public,private',
        ]);

        $isPublicEvent = str_starts_with($id, 'db-');

        if ($isPublicEvent) {
            $realId = str_replace('db-', '', $id);
            $event = PublicEvent::where('id', $realId)->where('user_id', $user->id)->firstOrFail();

            // ➤ If switched to PRIVATE → migrate to Google
            if ($request->visibility === 'private') {
                $token = json_decode($user->google_token, true);
                $client = $this->getGoogleClient();
                $client->setAccessToken($token);

                if ($client->isAccessTokenExpired() && isset($token['refresh_token'])) {
                    $client->fetchAccessTokenWithRefreshToken($token['refresh_token']);
                    $user->google_token = json_encode($client->getAccessToken());
                    $user->save();
                }

                $service = new \Google_Service_Calendar($client);

                $googleEvent = new \Google_Service_Calendar_Event([
                    'summary' => $request->title,
                    'description' => $request->description,
                    'start' => [
                        'dateTime' => Carbon::parse($request->start_time)->toRfc3339String(),
                        'timeZone' => config('app.timezone'),
                    ],
                    'end' => [
                        'dateTime' => Carbon::parse($request->end_time)->toRfc3339String(),
                        'timeZone' => config('app.timezone'),
                    ],
                ]);

                $createdEvent = $service->events->insert('primary', $googleEvent);
                $event->delete();

                return response()->json([
                    'message' => 'Event migrated to Google Calendar.',
                    'google_event_id' => $createdEvent->getId(),
                ]);
            }

            // ➤ Still public → just update
            $event->update($request->only(['title', 'description', 'start_time', 'end_time']));
            return response()->json(['message' => 'Public event updated.']);

        } else {
            // This is a PRIVATE (Google) event
            $token = json_decode($user->google_token, true);
            $client = $this->getGoogleClient();
            $client->setAccessToken($token);

            if ($client->isAccessTokenExpired() && isset($token['refresh_token'])) {
                $client->fetchAccessTokenWithRefreshToken($token['refresh_token']);
                $user->google_token = json_encode($client->getAccessToken());
                $user->save();
            }

            $service = new \Google_Service_Calendar($client);

            if ($request->visibility === 'public') {
                // ➤ Migrate to DB (delete from Google after copying)
                $googleEvent = $service->events->get('primary', $id);

                PublicEvent::create([
                    'user_id' => $user->id,
                    'title' => $request->title,
                    'description' => $request->description,
                    'start_time' => $request->start_time,
                    'end_time' => $request->end_time,
                ]);

                $service->events->delete('primary', $id);

                return response()->json(['message' => 'Event migrated to public (local DB).']);
            }

            // ➤ Still private → update Google
            $googleEvent = $service->events->get('primary', $id);
            $googleEvent->setSummary($request->title);
            $googleEvent->setDescription($request->description);
            $googleEvent->setStart(new \Google_Service_Calendar_EventDateTime([
                'dateTime' => Carbon::parse($request->start_time)->toRfc3339String(),
                'timeZone' => config('app.timezone'),
            ]));
            $googleEvent->setEnd(new \Google_Service_Calendar_EventDateTime([
                'dateTime' => Carbon::parse($request->end_time)->toRfc3339String(),
                'timeZone' => config('app.timezone'),
            ]));

            $service->events->update('primary', $id, $googleEvent);

            return response()->json(['message' => 'Google event updated.']);
        }
    }
    
    // Fetch events
    public function getEvents()
    {
        $user = auth()->user();
        $allEvents = [];

        // 1. Get DB events (public)
        $dbEvents = PublicEvent::where('user_id', $user->id)->get()->map(function ($e) {
            return [
                'id' => 'db-' . $e->id,
                'title' => $e->title,
                'start' => $e->start_time,
                'end' => $e->end_time,
                'description' => $e->description,
                'status' => $e->status,
                'visibility_type' => 'public',
                'color' => '#43a047',
            ]; 
        })->toArray(); // <- convert to plain array
    
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
        
        $calendarsToCheck = [
            'primary',
            'en.philippines#holiday@group.v.calendar.google.com',
        ];
        
        try {

            $googleEvents = [];
            foreach ($calendarsToCheck as $calendarId) {
                $events = $service->events->listEvents($calendarId, [
                    'timeMin' => now()->toRfc3339String(),
                    'maxResults' => 50,
                    'singleEvents' => true,
                    'orderBy' => 'startTime',
                ]);
        
                foreach ($events->getItems() as $event) {
                    $googleEvents[] = [
                        'id' => $event->getId(),
                        'title' => $event->getSummary(),
                        'start' => $event->getStart()->getDateTime() ?? $event->getStart()->getDate(),
                        'end' => $event->getEnd()->getDateTime() ?? $event->getEnd()->getDate(),
                        'description' => $event->getDescription() ?? '',
                        'calendar' => $calendarId,
                        'visibility_type' => 'private',
                        'color' => '#1976d2',
                    ];
                }
            }
        
            return response()->json(array_merge($dbEvents, $googleEvents));
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

    public function deleteEvent($id)
    {
        $user = auth()->user();

        if (!$user->google_token) {
            return response()->json(['error' => 'Google Calendar not connected.'], 403);
        }

        $token = json_decode($user->google_token, true);
        $client = $this->getGoogleClient();
        $client->setAccessToken($token);

        if ($client->isAccessTokenExpired() && isset($token['refresh_token'])) {
            $client->fetchAccessTokenWithRefreshToken($token['refresh_token']);
            $user->google_token = json_encode($client->getAccessToken());
            $user->save();
        }

        $service = new \Google_Service_Calendar($client);

        try {
            $service->events->delete('primary', $id);
            return response()->json(['message' => 'Event deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to delete event.',
                'details' => $e->getMessage()
            ], 500);
        }
    }

    public function updatePublicEvent(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
        ]);

        $event = PublicEvent::where('user_id', auth()->id())->findOrFail($id);
        $event->update($request->only(['title', 'description', 'start_time', 'end_time', 'status']));

        return response()->json(['message' => 'Public event updated successfully.']);
    }

    public function deletePublicEvent($id)
    {
        $event = PublicEvent::where('user_id', auth()->id())->findOrFail($id);
        $event->delete();

        return response()->json(['message' => 'Public event deleted successfully.']);
    }

}