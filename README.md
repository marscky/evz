EVZ
===
_Humanised, hassle-free evaluation._


<img src="http://marscky.github.io/evz/assets/intro.png" alt="EVZ in action" width="400px">

What is it?
-----------
A menubar application that automatically runs evaluation for you. Say goodbye to reminder emails.

Download the latest version  [here](https://github.com/marscky/evz/releases/latest)
---------
Note that you should install EVZ on **ONLY ONE** machine at a time.

**OS X**

1. Unzip the downloaded file and drag `EVZ.app` to `Applications` folder.
2. In order to allow EVZ to be opened, `Right click` on the app and choose `Open` from the menu.
3. A tick icon should appear in the menubar (see pic above).

**Windows**

1. Unzip the downloaded file and drag `EVZ` folder to `C:\Program files`  folder.
2. Open `EVZ.exe` inside the folder.
3. A tick icon should appear in the notifications area of the taskbar.

Setting up
----------

1. Before beginning, again ensure that you do not have EVZ installed on other machines.
2. Login with your HKU Portal account.
3. Evaluation will be run automatically for you at 21:00 every day.
4. It will also start automatically when you turn on your machine.

## FAQ

**1. I am concerned about commiting my HKU portal account credentials to the program.**

Rest assured, EVZ will never send your password to any other parties or store your password in plaintext.

In fact, your credentials are stored by a secure password management service provided by your operating system, by using the Node module [keytar](https://www.npmjs.com/package/keytar).

_From its documentation_

> A native Node module to get, add, replace, and delete passwords in system's
> keychain. On OS X the passwords are managed by the Keychain, on Linux they
> are managed by Gnome Keyring and on Windows they are managed by Credential
> Vault.`

**2. How do I remove the credentials stored?**

If you are logged in, choose `Logout` from the menu. This will remove the password stored in your system.

**3. Why do I not see a scheduled run at 21:00?**

In fact, automatic evaluation will not be run if you have performed any evaluation through EVZ after noon on the same day. You can always choose `Evaluate now` from the menu if you want to manually trigger an evaluation.

License
-------
Copyright (c) 2016, Mars Cheng. (License: GPL-2.0)

See LICENSE for more info.

Credits
-------
- Check icon made by <a href="http://www.google.com" title="Google">Google</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed under <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0">CC BY 3.0</a>.
- Clear button icon made by <a href="http://www.google.com" title="Google">Google</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed under <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0">CC BY 3.0</a>.
