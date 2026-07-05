{{- define "aqi-microservices.name" -}}
{{- .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "aqi-microservices.fullname" -}}
{{- printf "%s-%s" .Release.Name (include "aqi-microservices.name" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "aqi-microservices.labels" -}}
app.kubernetes.io/name: {{ include "aqi-microservices.name" . }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}
