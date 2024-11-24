function toggleMenu() {
    const userMenu = document.getElementById('userMenu');
    userMenu.classList.toggle('active');
}

document.addEventListener('click', function (event) {
    const userMenu = document.getElementById('userMenu');
    const userNameButton = document.querySelector('.user-name');

    if (!userNameButton.contains(event.target) && !userMenu.contains(event.target)) {
        userMenu.classList.remove('active');
    }
});
