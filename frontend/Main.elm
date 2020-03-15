port module Main exposing (..)

import Browser
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Json.Encode as E


port doLogin : { isNew : Bool, data : Model } -> Cmd msg


main =
    Browser.document
        { init = init
        , subscriptions = subscriptions
        , update = update
        , view = view
        }


type Msg
    = EmailChange String
    | NameChange String
    | PasswordChange String
    | ConfirmPasswordChange String
    | DoLogin
    | DoNewLogin


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
    case msg of
        EmailChange str ->
            ( { model | email = str }, Cmd.none )

        PasswordChange str ->
            ( { model | password = str }, Cmd.none )

        ConfirmPasswordChange str ->
            ( { model | confirmPassword = str }, Cmd.none )

        NameChange str ->
            ( { model | name = str }, Cmd.none )

        DoLogin ->
            ( model, doLogin { isNew = False, data = model } )

        DoNewLogin ->
            ( model, doLogin { isNew = True, data = model } )


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
                    , input [ type_ "email", placeholder "email@example.com", value model.email, onInput EmailChange ] []
                    , input [ type_ "password", placeholder "password", value model.password, onInput PasswordChange ] []
                    , input [ type_ "button", value "Login", onClick DoLogin ] []
                    ]
                , div []
                    [ h4 [] [ text "New user" ]
                    , input [ placeholder "name", value model.name, onInput NameChange ] []
                    , input [ type_ "email", placeholder "email@example.com", value model.email, onInput EmailChange ] []
                    , input [ type_ "password", placeholder "password", value model.password, onInput PasswordChange ] []
                    , input [ type_ "password", placeholder "confirm password", value model.confirmPassword, onInput ConfirmPasswordChange ] []
                    , input [ type_ "button", value "Sign up", onClick DoNewLogin ] []
                    ]
                ]
            , span []
                [ text "* Google sign in requires third party cookies enabled for "
                , em [] [ text "google.com" ]
                ]
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
