import Link from 'next/link';

export default ({ currentUser }) => {
    const links = [
        !currentUser && { label: 'Sign Up', href: '/auth/signup' }, 
        !currentUser && { label: 'Sign In', href: '/auth/signin' },
        currentUser && { label: 'Create Ticket', href: '/tickets/new'},
        currentUser && { label: 'Sign Out', href: '/auth/signout' },
    ]
        .filter(linkConfig => linkConfig)
        .map(({ label, href }) => {
            return <li key={href} className='nav-item'>
                <Link href={href}>
                    {label}
                </Link>
            </li>
        });

    return(
        <ul class="nav flex-column">
            <li class="nav-item">
                <Link href='/'>
                    MovieTickets
                </Link>
            </li>
            {links}
        </ul>        
    );
};