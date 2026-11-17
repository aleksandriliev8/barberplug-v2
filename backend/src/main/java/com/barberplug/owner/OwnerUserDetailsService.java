package com.barberplug.owner;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/** Lets Spring Security sign the Owner in by email. */
@Service
class OwnerUserDetailsService implements UserDetailsService {

    private final OwnerRepository owners;

    OwnerUserDetailsService(OwnerRepository owners) {
        this.owners = owners;
    }

    @Override
    public UserDetails loadUserByUsername(String email) {
        return owners.findByEmail(Owner.normalizeEmail(email))
                .map(owner -> User.withUsername(owner.getEmail())
                        .password(owner.getPasswordHash())
                        .roles("OWNER")
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("No Owner with that email"));
    }
}
