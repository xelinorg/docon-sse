cd crypto
echo "ca and peer key and crt pems"
CA_SUBJ="/C=gh/ST=Athens/L=Europe/O=docon-sse/CN=CA.docon-sse"
echo "CA_SUBJ is $CA_SUBJ"
CRLOPP_SUBJ="/C=gh/ST=Athens/L=Europe/O=docon-sse/CN=server.docon-sse"
echo "CRLOPP_SUBJ is $CRLOPP_SUBJ"

echo "doing CA key"
openssl genrsa -out rootCA.key 4096
echo "doing CA crt"
openssl req -x509 -new -nodes -key rootCA.key -sha256 -days 1024 -out rootCA.crt -subj $CA_SUBJ
echo "doing key"
openssl genrsa -out docon-sse.key 2048
echo "doing csr"
openssl req -new -key docon-sse.key -out docon-sse.csr -subj $CRLOPP_SUBJ
echo "doing crt"
openssl x509 -req -in docon-sse.csr -CA rootCA.crt -CAkey rootCA.key -CAcreateserial -out docon-sse.crt -days 500 -sha256

echo "doing pems"
openssl rsa -in docon-sse.key -text > docon-sse.key.pem
openssl x509 -inform PEM -in docon-sse.crt > docon-sse.crt.pem
openssl x509 -inform PEM -in rootCA.crt > rootCA.crt.pem

openssl x509 -in docon-sse.crt.pem -noout -text
openssl x509 -in rootCA.crt.pem -noout -text
