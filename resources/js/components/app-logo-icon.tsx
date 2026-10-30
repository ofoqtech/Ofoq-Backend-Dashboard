import type { HTMLAttributes } from 'react';

export default function AppLogoIcon(props: HTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/logo dark.jpeg"
            alt="Ofoq Logo"
            className="rounded-lg object-contain"
            {...props}
        />
    );
}
