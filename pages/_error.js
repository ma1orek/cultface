// pages/_error.js
function Error({ statusCode }) {
  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h1>Coś poszło nie tak</h1>
      <p>
        {statusCode
          ? `Błąd ${statusCode} po stronie serwera`
          : 'Błąd po stronie klienta'}
      </p>
    </div>
  )
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
