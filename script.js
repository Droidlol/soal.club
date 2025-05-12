document.addEventListener('DOMContentLoaded', () => {
    // Animate the code snippet with a typing effect
    const codeText = document.querySelector('.code-snippet code');
    const originalText = codeText.innerHTML;
    
    // Only run the animation if not on mobile
    if (window.innerWidth > 768) {
        animateTyping(codeText, originalText);
    }
    
    // Add active class to nav links on scroll
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
    
    // Add subtle parallax effect to stats
    const stats = document.querySelector('.stats');
    if (stats) {
        window.addEventListener('scroll', () => {
            const scrollY = window.pageYOffset;
            const statsTop = stats.offsetTop;
            
            if (scrollY > statsTop - 600 && scrollY < statsTop + 600) {
                const shift = (scrollY - statsTop + 600) / 20;
                stats.style.transform = `translateY(${shift}px)`;
            }
        });
    }
});

// Function to create typing animation
function animateTyping(element, text) {
    element.innerHTML = '';
    let i = 0;
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, 5); // Type very fast
        }
    }
    
    setTimeout(() => {
        type();
    }, 1000); // Start after 1 second
}
