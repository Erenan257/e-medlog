import React from 'react';
import logoImg from '../assets/logo512.png'; 

function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        
        
        <div style={styles.brandSection}>
            <img src={logoImg} alt="Logo" style={{width: '24px', height: 'auto', marginRight: '10px'}} />
            <span style={{fontWeight: '600', color: '#333'}}>E-MedLog</span>
        </div>

        
        <div style={styles.copyright}>
            <p style={{margin: 0}}>
                © {new Date().getFullYear()} Instituto Federal de Brasília
            </p>
        </div>

        
        <div style={styles.linksSection}>
            
            
            <a href="mailto:erenan257@gmail.com" style={styles.iconLink} title="Enviar E-mail">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <span style={styles.linkText}>Contato</span>
            </a>

            
            <div style={{width: '1px', height: '15px', backgroundColor: '#ccc', margin: '0 10px'}}></div>

            
            <a href="https://github.com/Erenan257/tcc" target="_blank" rel="noopener noreferrer" style={styles.iconLink} title="Ver no GitHub">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
                <span style={styles.linkText}>GitHub</span>
            </a>

        </div>

      </div>
    </footer>
  );
}

const styles = {
  footer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    backgroundColor: '#f8f9fa', 
    borderTop: '1px solid #e9ecef',
    padding: '12px 0',
    fontSize: '0.85rem',
    color: '#6c757d',
    zIndex: 10
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px'
  },
  brandSection: {
    display: 'flex',
    alignItems: 'center',
    flex: 1 
  },
  copyright: {
    flex: 2,
    textAlign: 'center',
    fontWeight: '500'
  },
  linksSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1
  },
  iconLink: {
    display: 'flex',
    alignItems: 'center',
    color: '#495057',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
    gap: '6px'
  },
  linkText: {
    fontWeight: '500',
    display: 'inline-block' 
  }
};

export default Footer;