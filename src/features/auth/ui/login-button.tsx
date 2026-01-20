import { callbackUrl, useLoginMutation } from "../api/use-login-mutation"

export const LoginButton = () => {
    
    const mutation = useLoginMutation()

    const handleLoginClick = () => {
        // mutation.mutate({code: '?????'})
        window.addEventListener('message', handleOauthMessage)

        window.open(`https://musicfun.it-incubator.app/api/1.0/auth/oauth-redirect?callbackUrl=${callbackUrl}`, 'apihub-oauth2', 'width=500,height=600')
    }

    const handleOauthMessage = (event: MessageEvent) => {
        window.removeEventListener('message', handleOauthMessage)
        if (event.origin !== window.location.origin) {
            console.warn('Invalid origin', event.origin)
            return
        }
        const code = event.data.code
        if (code) {
            mutation.mutate({code})
        } 
    }

    return (
        <button onClick={handleLoginClick}>Login with apihub</button>
    )
}