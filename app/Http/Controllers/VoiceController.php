<?php

namespace App\Http\Controllers;

use Twilio\Rest\Client;
use Twilio\Jwt\AccessToken;
use Twilio\Jwt\Grants\VoiceGrant;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class VoiceController extends Controller
{

    public function makeCall(Request $request)
    {
        Log::info("VoiceController::makeCall");
        Log::info("Phone Number: " . $request->input('phoneNumber'));

        $client = new Client(env('TWILIO_ACCOUNT_SID'), env('TWILIO_AUTH_TOKEN'));

        $call = $client->calls->create(
            // $request->input('phoneNumber'), // Client's phone number
            "+639365227453",
            env('TWILIO_PHONE_NUMBER'), // Your Twilio number
            [
                'url' => 'https://phplaravel-719501-3975047.cloudwaysapps.com/api/twiml',
                'record' => true // Enable call recording
            ]
        );

        return response()->json(['call_sid' => $call->sid, 'status' => 200]);
    }

    public function twiml(Request $request)
    {
        $response = new \Twilio\TwiML\VoiceResponse();
    
        $clientNumber = "+639365227453"; // Example client number
        $response->say("Hello, this call is from Premier Heavy Equipment. Please wait while we connect your call. Thank you!!!");
    
        $dial = $response->dial();
        $dial->number($clientNumber);
    
        return response($response)->header('Content-Type', 'text/xml');
    }


    public function handleRecording(Request $request)
    {
        Log::info("VoiceController::handleRecording");

        // Retrieve the recording URL from the request
        $recordingUrl = $request->input('RecordingUrl');

        // Log the recording URL
        Log::info("Recording URL: " . $recordingUrl);

        return response()->json(['status' => 'Recording logged']);
    }


    // Optional: Handle call status updates
    public function callStatus(Request $request)
    {
        Log::info("VoiceController::callStatus");
        Log::info($request->all());

        // You can process call status updates here, e.g., log or save to database

        return response()->json(['status' => 'Status received']);
    }

    public function getToken(Request $request)
    {
        Log::info("VoiceController::getToken");

        // $twilioSid = env("TWILIO_ACCOUNT_SID");
        // $twilioApiKeySid = env("TWILIO_API_KEY_SID");
        // $twilioApiKeySecret = env("TWILIO_API_KEY_SECRET");
        // $twilioApplicationSid = env('TWILIO_APPLICATION_SID');

        $twilioSid = "ACed346a77f6985a51840b87746a9194b7";
        $twilioApiKeySid = "SKa702348fc96db6444c226baa03d14d34";
        $twilioApiKeySecret = "rvCOlZB6mh0ueYrF6DU6GdJrpUnLdyZF";

        // ManPro Call
        // $twilioApplicationSid = "APdb6217149573bb49ffe072311f6eea79";
        // ManPro Call App
        $twilioApplicationSid = "APc35070d5756612f656f70ac88e7e1d36";





        // Generate a unique identity for the user or use the provided one
        $identity = $request->input('identity') ?? uniqid('user_');

        // Create the access token
        $token = new AccessToken($twilioSid, $twilioApiKeySid, $twilioApiKeySecret, 3600, $identity);

        // Create a voice grant
        $voiceGrant = new VoiceGrant();
        $voiceGrant->setOutgoingApplicationSid($twilioApplicationSid);
        $voiceGrant->setIncomingAllow(true); // If you want to allow incoming calls
        $token->addGrant($voiceGrant);

        log::info($token->toJWT());

        return response()->json(['token' => $token->toJWT()]);
    }
}
