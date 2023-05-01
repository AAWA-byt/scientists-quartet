import React from 'react';
import '../index.css';

// Footer-Komponente, die die Links zur Impressum, Datenschutz und Source Code Seiten enthält
const Footer = () => {
    return (
        <div className="footer-dark">
            <footer>
                <center>
                    <div className="container">
                        <div className="row">
                            <h3>Physiker Quartett</h3>
                            <ul>
                                <li><a href="https://www.aaronwagner.de/impressum/">Impressum</a></li>
                                <li><a href="https://github.com/AAWA-byt/physiker-quartet">Source Code</a></li>
                            </ul>
                        </div>
                        <p class="copyright"><a href='https://www.github.com/AAWA-byt'>Developed by Aaron Wagner</a></p>
                        <p class="copyright">© 2023 Aaron Wagner</p>
                    </div>
                </center>
            </footer>
        </div>
    );
};

export default Footer;
