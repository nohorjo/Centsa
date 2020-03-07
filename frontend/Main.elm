module Main exposing (Document, Flags, Model, Msg(..), init, main, subscriptions, update, view)

import Browser
import Html exposing (..)
import Html.Attributes exposing (..)


main =
    Browser.document
        { init = init
        , subscriptions = subscriptions
        , update = update
        , view = view
        }


type Msg
    = NoOp


type alias Model =
    { name : String
    , email : String
    , password : String
    , confirmPassword : String
    }


type alias Document msg =
    { title : String
    , body : List (Html msg)
    }


type alias Flags =
    {}


init : Flags -> ( Model, Cmd Msg )
init flags =
    ( { name = ""
      , email = ""
      , password = ""
      , confirmPassword = ""
      }
    , Cmd.none
    )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    ( model, Cmd.none )


view : Model -> Browser.Document Msg
view model =
    { title = "Centsa money managing solution"
    , body =
        [ div [ class "login-form" ]
            [ img
                [ src "icon.svg"
                , alt "logo"
                , class "logo"
                ]
                []
            , div
                [ class "fb-login-button"
                , attribute "data-max-rows" "3"
                , attribute "data-size" "large"
                , attribute "data-button-type" "login_with"
                , attribute "data-use-continue-as" "true"
                , attribute "data-scope" "public_profile,email"
                , attribute "onlogin" "checkLoginState();"
                ]
                []
            , div [ id "g-signin2" ] []
            , div [ class "manual" ]
                [ div []
                    [ h4 [] [ text "Existing user" ]
                    , input [ type_ "email", placeholder "email@example.com" ] []
                    , input [ type_ "password", placeholder "password" ] []
                    , input [ type_ "button", value "Login" ] []
                    ]
                , div []
                    [ h4 [] [ text "New user" ]
                    , input [ placeholder "name" ] []
                    , input [ type_ "email", placeholder "email@example.com" ] []
                    , input [ type_ "password", placeholder "password" ] []
                    , input [ type_ "password", placeholder "confirm password" ] []
                    , input [ type_ "button", value "Sign up" ] []
                    ]
                ]
            , text "* Google sign in requires third party cookies enabled for "
            , em [] [ text "google.com" ]
            ]
        , div [ class "cookie-notice" ] [ text "Centsa uses cookies to store login state. By using this service you are agreeing to having these cookies stored on your device" ]
        , a
            [ href "https://github.com/nohorjo/Centsa"
            , target "_blank"
            ]
            [ img
                [ src "https://camo.githubusercontent.com/365986a132ccd6a44c23a9169022c0b5c890c387/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f7265645f6161303030302e706e67"
                , class "gh-link"
                , alt "Fork me on GitHub"
                ]
                []
            ]
        ]
    }
