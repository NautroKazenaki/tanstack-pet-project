import { useMutation } from "@tanstack/react-query"
import { client } from "../../../shared/api/client"

export const LoginButton = () => {
    const callbackUrl = 'http://localhost:5173/oauth/callback'
    const mutation = useMutation({
        mutationFn: async ({code}: {code: string}) => {
            const response = await client.POST('/auth/login', {
                body: {
                    code,
                    redirectUri: callbackUrl,
                    rememberMe: true,
                    accessTokenTTL: '1d'
                }
            })
            if (response.error) throw new Error(response.error.message)
            return response.data
        },
        onSuccess: (data) => {
            localStorage.setItem('musicfun-token', data.accessToken)
            localStorage.setItem('musicfun-refresh-token', data.refreshToken)
        }
    })

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