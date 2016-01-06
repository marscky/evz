EVZ
===
_Humanised, hassle-free evaluation._


<img src="http://marscky.github.io/evz/assets/intro.png" alt="EVZ in action" width="400px">

What is it?
-----------
A menubar application that automatically runs evaluation for you. Say goodbye to reminder emails.

Downloads
---------

Get the latest releases [here](https://github.com/marscky/evz/releases/latest). Only OS X builds are available at the moment.

Setting up
----------

Before proceeding, please note that you **SHOULD NOT** install EVZ on more than one machine at a time.

1. Login with your HKU Portal account.
2. Evaluation will be run automatically for you at 21:00 every day.
3. It will also start when you turn on your machine.

## FAQ

**1. I am concerned about commiting my HKU portal account credentials to the program.**

Rest assured, EVZ will never send your password to any other parties or store your password in plaintext.

In fact, your credentials are stored on a secure password management service provided by your operating system, by using the Node module [keytar](https://www.npmjs.com/package/keytar).

_From its documentation_

> A native Node module to get, add, replace, and delete passwords in system's
> keychain. On OS X the passwords are managed by the Keychain, on Linux they
> are managed by Gnome Keyring and on Windows they are managed by Credential
> Vault.`

**2. How do I remove the credentials stored?**

If you are logged in, choose `Logout` from the menu. This will remove the password stored in your system.

License
-------
Copyright (c) 2016, Mars Cheng. (License: GPL-2.0)

See LICENSE for more info.
